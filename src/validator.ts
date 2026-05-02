export type ConformanceLevel = "L0" | "L1" | "L2" | "L3";
export type ValidationStatus = "pass" | "warn" | "fail";

export interface ValidationCheck {
  id: string;
  status: ValidationStatus;
  message: string;
  detail?: string;
}

export interface AgentViewSections {
  meta?: string;
  intent?: string;
  state?: string;
  actions?: string;
  context?: string;
  nav?: string;
  [section: string]: string | undefined;
}

export interface ValidateAgentViewOptions {
  contentType?: string | null;
  source?: string;
}

export interface ValidationReport {
  ok: boolean;
  level: ConformanceLevel | null;
  source?: string;
  checks: ValidationCheck[];
  sections: string[];
}

const KNOWN_SECTIONS = new Set([
  "meta",
  "intent",
  "state",
  "actions",
  "context",
  "nav",
]);

export function validateAgentViewText(
  text: string,
  options: ValidateAgentViewOptions = {}
): ValidationReport {
  const parsed = parseAgentViewSections(text);
  const checks: ValidationCheck[] = [];

  if (options.contentType) {
    checks.push({
      id: "document.content_type",
      status: options.contentType.toLowerCase().includes("text/agent-view")
        ? "pass"
        : "warn",
      message: "Content-Type advertises text/agent-view",
      detail: options.contentType,
    });
  }

  for (const duplicate of parsed.duplicates) {
    checks.push({
      id: "document.duplicate_section",
      status: "fail",
      message: `Duplicate @${duplicate} section`,
    });
  }

  for (const unknown of parsed.unknownSections) {
    checks.push({
      id: "document.unknown_section",
      status: "warn",
      message: `Unknown @${unknown} section`,
    });
  }

  addSectionChecks(checks, parsed.sections);
  addToonChecks(checks, parsed.sections.state);
  addActionsChecks(checks, parsed.sections.actions);

  const level = inferConformanceLevel(parsed.sections, checks);
  const ok = checks.every(check => check.status !== "fail");

  return {
    ok,
    level,
    source: options.source,
    checks,
    sections: Object.keys(parsed.sections),
  };
}

export function parseAgentViewSections(text: string): {
  sections: AgentViewSections;
  duplicates: string[];
  unknownSections: string[];
} {
  const sections: AgentViewSections = {};
  const duplicates: string[] = [];
  const unknownSections: string[] = [];
  let current: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (!current) return;
    const body = buffer.join("\n").trimEnd();
    if (sections[current] !== undefined) {
      duplicates.push(current);
    }
    sections[current] = body;
    buffer = [];
  };

  for (const line of text.replace(/\r\n/g, "\n").split("\n")) {
    const match = /^@([A-Za-z][A-Za-z0-9_-]*)\s*$/.exec(line);
    if (match) {
      flush();
      current = match[1];
      if (!KNOWN_SECTIONS.has(current)) {
        unknownSections.push(current);
      }
      continue;
    }
    if (current) {
      buffer.push(line);
    }
  }
  flush();

  return { sections, duplicates, unknownSections };
}

function addSectionChecks(checks: ValidationCheck[], sections: AgentViewSections) {
  const meta = parseKeyValueBlock(sections.meta ?? "");
  const intent = parseKeyValueBlock(sections.intent ?? "");

  checks.push(requiredSection("document.meta", sections.meta, "@meta is present"));
  checks.push(requiredField("document.meta.v", meta.v, "@meta.v is present"));
  checks.push(
    requiredField("document.meta.route", meta.route, "@meta.route is present")
  );
  checks.push(
    requiredField(
      "document.meta.generated",
      meta.generated,
      "@meta.generated is present"
    )
  );

  checks.push(
    requiredSection("document.intent", sections.intent, "@intent is present")
  );
  checks.push(
    requiredField(
      "document.intent.purpose",
      intent.purpose,
      "@intent.purpose is present"
    )
  );
  checks.push(
    requiredField(
      "document.intent.audience",
      intent.audience,
      "@intent.audience is present"
    )
  );
  checks.push(
    requiredField(
      "document.intent.capability",
      intent.capability,
      "@intent.capability is present"
    )
  );

  checks.push(optionalSection("document.state", sections.state, "@state is present"));
  checks.push(
    optionalSection("document.actions", sections.actions, "@actions is present")
  );
  checks.push(
    optionalSection("document.context", sections.context, "@context is present")
  );
  checks.push(optionalSection("document.nav", sections.nav, "@nav is present"));
}

function addToonChecks(checks: ValidationCheck[], state: string | undefined) {
  if (!state) return;
  const toonChecks = validateToonState(state);
  checks.push(...toonChecks);
}

function addActionsChecks(checks: ValidationCheck[], actions: string | undefined) {
  if (!actions) return;
  const hasActionId = /^\s*-\s+id\s*:/m.test(actions);
  checks.push({
    id: "document.actions.ids",
    status: hasActionId ? "pass" : "warn",
    message: "@actions includes at least one action id",
  });
}

export function validateToonState(state: string): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const lines = state.replace(/\r\n/g, "\n").split("\n");
  let tableCount = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim() === "") continue;

    if (leadingSpaces(line) % 2 !== 0) {
      checks.push({
        id: "toon.indentation",
        status: "fail",
        message: "TOON indentation uses two-space levels",
        detail: `line ${i + 1}: ${line}`,
      });
    }

    const scalarList = /^(\s*)[A-Za-z_][A-Za-z0-9_-]*\[(\d+)]\s*:\s*(.+)$/.exec(
      line
    );
    if (scalarList) {
      const expected = Number(scalarList[2]);
      const values = splitCsv(scalarList[3]);
      checks.push({
        id: "toon.list_count",
        status: values.length === expected ? "pass" : "fail",
        message: "TOON inline list count matches values",
        detail:
          values.length === expected
            ? undefined
            : `line ${i + 1}: expected ${expected}, found ${values.length}`,
      });
      continue;
    }

    const tableHeader =
      /^(\s*)[A-Za-z_][A-Za-z0-9_-]*\[(\d+)]\{([^}]*)}\s*:\s*$/.exec(line);
    if (!tableHeader) continue;

    tableCount += 1;
    const baseIndent = tableHeader[1].length;
    const expectedRows = Number(tableHeader[2]);
    const fields = tableHeader[3].split(",").map(field => field.trim());
    let rows = 0;

    for (let rowIndex = i + 1; rowIndex < lines.length; rowIndex += 1) {
      const row = lines[rowIndex];
      if (row.trim() === "") continue;
      const rowIndent = leadingSpaces(row);
      if (rowIndent <= baseIndent) break;
      rows += 1;
      const values = splitCsv(row.trim());
      checks.push({
        id: "toon.table_columns",
        status: values.length === fields.length ? "pass" : "fail",
        message: "TOON table row column count matches header",
        detail:
          values.length === fields.length
            ? undefined
            : `line ${rowIndex + 1}: expected ${fields.length}, found ${values.length}`,
      });
      i = rowIndex;
    }

    checks.push({
      id: "toon.table_rows",
      status: rows === expectedRows ? "pass" : "fail",
      message: "TOON table row count matches declaration",
      detail:
        rows === expectedRows
          ? undefined
          : `line ${i + 1}: expected ${expectedRows}, found ${rows}`,
    });
  }

  checks.push({
    id: "toon.profile",
    status: "pass",
    message:
      tableCount > 0
        ? "TOON state profile checked"
        : "TOON state profile checked with no tabular collections",
  });

  return checks;
}

function inferConformanceLevel(
  sections: AgentViewSections,
  checks: ValidationCheck[]
): ConformanceLevel | null {
  const hasRequiredBase = [
    "document.meta",
    "document.meta.v",
    "document.meta.route",
    "document.meta.generated",
    "document.intent",
    "document.intent.purpose",
    "document.intent.audience",
    "document.intent.capability",
  ].every(id => checks.find(check => check.id === id)?.status === "pass");

  if (!hasRequiredBase) return null;
  if (sections.state && sections.actions && sections.context && sections.nav) {
    return "L3";
  }
  if (sections.state && sections.actions) return "L2";
  if (sections.state) return "L1";
  return "L0";
}

function requiredSection(
  id: string,
  body: string | undefined,
  message: string
): ValidationCheck {
  return {
    id,
    status: body !== undefined ? "pass" : "fail",
    message,
  };
}

function optionalSection(
  id: string,
  body: string | undefined,
  message: string
): ValidationCheck {
  return {
    id,
    status: body !== undefined ? "pass" : "warn",
    message,
  };
}

function requiredField(
  id: string,
  value: string | undefined,
  message: string
): ValidationCheck {
  return {
    id,
    status: value && value.trim() ? "pass" : "fail",
    message,
  };
}

function parseKeyValueBlock(block: string): Record<string, string> {
  const values: Record<string, string> = {};
  for (const line of block.split("\n")) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*?)\s*$/.exec(line);
    if (match) values[match[1]] = match[2];
  }
  return values;
}

function leadingSpaces(line: string): number {
  return line.length - line.trimStart().length;
}

function splitCsv(input: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;
  let escaped = false;

  for (const char of input) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === "\\" && quoted) {
      escaped = true;
      current += char;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      current += char;
      continue;
    }
    if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  values.push(current.trim());
  return values.filter(value => value.length > 0);
}
