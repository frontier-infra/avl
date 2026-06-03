#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  type ValidationCheck,
  type ValidationReport,
  validateAgentViewText,
} from "./validator";

interface CliOptions {
  json: boolean;
  minLevel?: "L0" | "L1" | "L2" | "L3";
}

interface SiteValidationReport extends ValidationReport {
  url: string;
}

const LEVEL_ORDER = ["L0", "L1", "L2", "L3"] as const;

async function main(argv: string[]) {
  const [command, ...rest] = argv;
  const { args, options } = parseOptions(rest);

  if (!command || command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "validate-file") {
    const file = args[0];
    if (!file) usageError("Missing file path");
    const path = resolve(file);
    const text = await readFile(path, "utf8");
    const report = validateAgentViewText(text, { source: path });
    finish(report, options);
    return;
  }

  if (command === "validate") {
    const target = args[0];
    if (!target) usageError("Missing URL");
    const report = await validateUrl(target);
    finish(report, options);
    return;
  }

  usageError(`Unknown command: ${command}`);
}

function parseOptions(args: string[]): { args: string[]; options: CliOptions } {
  const positional: string[] = [];
  const options: CliOptions = { json: false };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (arg === "--level") {
      const level = args[i + 1];
      if (!isLevel(level)) usageError("--level must be one of L0, L1, L2, L3");
      options.minLevel = level;
      i += 1;
      continue;
    }
    positional.push(arg);
  }

  return { args: positional, options };
}

async function validateUrl(input: string): Promise<SiteValidationReport> {
  const url = new URL(input);
  const isAgentDocument = url.pathname.endsWith(".agent");

  if (isAgentDocument) {
    const response = await fetchText(url, { accept: "text/agent-view" });
    const report = validateAgentViewText(response.text, {
      source: url.toString(),
      contentType: response.contentType,
    });
    return { ...report, url: url.toString() };
  }

  const origin = url.origin;
  const checks: ValidationCheck[] = [];
  const htmlResponse = await fetchText(url, { accept: "text/html" });
  const html = htmlResponse.text;
  const pageAgentUrl = companionUrlFor(url);
  const manifestUrl = new URL("/agent.txt", origin);
  const llmsUrl = new URL("/llms.txt", origin);

  checks.push({
    id: "discovery.html_alternate",
    status: hasHtmlAlternate(html) ? "pass" : "warn",
    message: "HTML exposes an alternate text/agent-view link",
  });
  checks.push({
    id: "discovery.body_link",
    status: hasBodyAgentLink(html) ? "pass" : "warn",
    message: "HTML exposes a crawlable body link or AVL badge",
  });

  const manifest = await tryFetchText(manifestUrl, { accept: "text/plain" });
  checks.push({
    id: "discovery.manifest",
    status: manifest?.ok ? "pass" : "warn",
    message: "/agent.txt discovery manifest is reachable",
    detail: manifest?.statusText,
  });
  if (manifest?.ok) {
    checks.push({
      id: "manifest.content_type",
      status: /text\/agent-view/i.test(manifest.text) ? "pass" : "warn",
      message: "/agent.txt declares text/agent-view support",
    });
  }

  const llms = await tryFetchText(llmsUrl, { accept: "text/plain" });
  checks.push({
    id: "companion.llms_txt",
    status: llms?.ok ? "pass" : "warn",
    message: "/llms.txt companion is reachable",
    detail: llms?.statusText,
  });

  const agent = await tryFetchText(pageAgentUrl, { accept: "text/agent-view" });
  if (!agent?.ok) {
    checks.push({
      id: "discovery.page_agent",
      status: "fail",
      message: "Page-specific .agent document is reachable",
      detail: agent?.statusText ?? "request failed",
    });
    return {
      ok: false,
      level: null,
      url: url.toString(),
      source: url.toString(),
      checks,
      sections: [],
    };
  }

  checks.push({
    id: "discovery.page_agent",
    status: "pass",
    message: "Page-specific .agent document is reachable",
  });

  const documentReport = validateAgentViewText(agent.text, {
    source: pageAgentUrl.toString(),
    contentType: agent.contentType,
  });
  const allChecks = [...checks, ...documentReport.checks];
  return {
    ...documentReport,
    ok: allChecks.every(check => check.status !== "fail"),
    url: url.toString(),
    source: pageAgentUrl.toString(),
    checks: allChecks,
  };
}

async function fetchText(
  url: URL,
  headers: { accept: string }
): Promise<{ text: string; contentType: string | null; statusText: string }> {
  const response = await fetch(url, {
    headers: { accept: headers.accept },
    redirect: "follow",
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${url.toString()} returned ${response.status}`);
  }
  return {
    text,
    contentType: response.headers.get("content-type"),
    statusText: `${response.status} ${response.statusText}`,
  };
}

async function tryFetchText(
  url: URL,
  headers: { accept: string }
): Promise<
  | { ok: true; text: string; contentType: string | null; statusText: string }
  | { ok: false; text: ""; contentType: null; statusText: string }
> {
  try {
    const response = await fetch(url, {
      headers: { accept: headers.accept },
      redirect: "follow",
    });
    const text = await response.text();
    if (!response.ok) {
      return {
        ok: false,
        text: "",
        contentType: null,
        statusText: `${response.status} ${response.statusText}`,
      };
    }
    return {
      ok: true,
      text,
      contentType: response.headers.get("content-type"),
      statusText: `${response.status} ${response.statusText}`,
    };
  } catch (error) {
    return {
      ok: false,
      text: "",
      contentType: null,
      statusText: error instanceof Error ? error.message : "request failed",
    };
  }
}

function finish(report: ValidationReport, options: CliOptions): never {
  const reportWithLevel = addMinimumLevelCheck(report, options.minLevel);

  if (options.json) {
    console.log(JSON.stringify(reportWithLevel, null, 2));
  } else {
    printReport(reportWithLevel);
  }

  process.exit(reportWithLevel.ok ? 0 : 1);
}

function addMinimumLevelCheck(
  report: ValidationReport,
  minLevel: CliOptions["minLevel"]
): ValidationReport {
  if (!minLevel) return report;
  const status =
    report.level && levelRank(report.level) >= levelRank(minLevel) ? "pass" : "fail";
  return {
    ...report,
    ok: report.ok && status === "pass",
    checks: [
      ...report.checks,
      {
        id: "conformance.minimum_level",
        status,
        message: `Document meets requested ${minLevel} conformance level`,
        detail: report.level ? `found ${report.level}` : "document is invalid",
      },
    ],
  };
}

function printReport(report: ValidationReport) {
  const title = report.level
    ? `AVL ${report.level} ${report.ok ? "Ready" : "Needs work"}`
    : "AVL Invalid";
  console.log(title);
  if (report.source) console.log(`Source: ${report.source}`);
  console.log("");

  for (const check of report.checks) {
    const prefix =
      check.status === "pass" ? "[PASS]" : check.status === "warn" ? "[WARN]" : "[FAIL]";
    const detail = check.detail ? ` (${check.detail})` : "";
    console.log(`${prefix} ${check.id} - ${check.message}${detail}`);
  }
}

function printHelp() {
  console.log(`AVL validator

Usage:
  avl validate <url> [--level L0|L1|L2|L3] [--json]
  avl validate-file <path> [--level L0|L1|L2|L3] [--json]

Examples:
  npx @frontier-infra/avl validate https://example.com
  npx @frontier-infra/avl validate-file ./pricing.agent --level L2
`);
}

function usageError(message: string): never {
  console.error(`Error: ${message}`);
  console.error("Run `avl help` for usage.");
  process.exit(2);
}

function hasHtmlAlternate(html: string): boolean {
  return /<link\b[^>]*rel=["'][^"']*alternate[^"']*["'][^>]*type=["']text\/agent-view/i.test(
    html
  );
}

function hasBodyAgentLink(html: string): boolean {
  return /<body[\s\S]*?(rel=["'][^"']*agent-view[^"']*["']|data-avl|avl-badge|\.agent)/i.test(
    html
  );
}

function companionUrlFor(url: URL): URL {
  if (url.pathname === "/" || url.pathname === "") {
    return new URL("/.agent", url.origin);
  }
  const path = url.pathname.replace(/\/+$/, "");
  return new URL(`${path}.agent`, url.origin);
}

function isLevel(value: string | undefined): value is CliOptions["minLevel"] {
  return value === "L0" || value === "L1" || value === "L2" || value === "L3";
}

function levelRank(level: "L0" | "L1" | "L2" | "L3"): number {
  return LEVEL_ORDER.indexOf(level);
}

main(process.argv.slice(2)).catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
