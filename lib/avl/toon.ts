// Token-Oriented Object Notation encoder.
// A compact, token-efficient text format for tabular and nested data.
//
// Examples:
//   user{id,role}: 42,attorney
//   journeys[3]{id,client,stage}:
//     J-101,Doe v Acme,Discovery
//     J-102,Roe v Beta,Settlement
//     J-103,Vega v Gamma,Treatment

function quoteIfNeeded(s: string): string {
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return s;
}

export function scalar(v: unknown): string {
  if (v === null || v === undefined) return "~";
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v instanceof Date) return v.toISOString();
  return quoteIfNeeded(String(v));
}

/** Encode a single named value as TOON lines (no leading indent). */
export function encodeNamed(name: string, value: unknown): string[] {
  if (value === null || value === undefined) {
    return [`${name}: ~`];
  }
  if (typeof value !== "object") {
    return [`${name}: ${scalar(value)}`];
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return [`${name}[0]:`];

    if (value.every(v => typeof v !== "object" || v === null)) {
      return [`${name}[${value.length}]: ${value.map(scalar).join(", ")}`];
    }

    const fieldsSet = new Set<string>();
    for (const v of value) {
      if (v && typeof v === "object" && !Array.isArray(v)) {
        for (const k of Object.keys(v as object)) fieldsSet.add(k);
      }
    }
    const fields = Array.from(fieldsSet);
    const lines = [`${name}[${value.length}]{${fields.join(",")}}:`];
    for (const item of value) {
      const obj = (item ?? {}) as Record<string, unknown>;
      lines.push(`  ${fields.map(f => scalar(obj[f])).join(",")}`);
    }
    return lines;
  }

  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (keys.length === 0) return [`${name}{}:`];

  if (keys.every(k => typeof obj[k] !== "object" || obj[k] === null)) {
    return [
      `${name}{${keys.join(",")}}: ${keys.map(k => scalar(obj[k])).join(",")}`,
    ];
  }

  const lines = [`${name}:`];
  for (const k of keys) {
    const sub = encodeNamed(k, obj[k]);
    for (const l of sub) lines.push(`  ${l}`);
  }
  return lines;
}
