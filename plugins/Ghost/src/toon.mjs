function quoteIfNeeded(value) {
  const string = String(value);
  if (/[",\n\r]/.test(string)) {
    return `"${string.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return string;
}

export function scalar(value) {
  if (value === null || value === undefined) return "~";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toISOString();
  return quoteIfNeeded(value);
}

export function encodeNamed(name, value) {
  if (value === null || value === undefined) {
    return [`${name}: ~`];
  }

  if (typeof value !== "object") {
    return [`${name}: ${scalar(value)}`];
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return [`${name}[0]:`];

    if (value.every((item) => typeof item !== "object" || item === null)) {
      return [`${name}[${value.length}]: ${value.map(scalar).join(", ")}`];
    }

    const fields = [];
    for (const item of value) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      for (const key of Object.keys(item)) {
        if (!fields.includes(key)) fields.push(key);
      }
    }

    const lines = [`${name}[${value.length}]{${fields.join(",")}}:`];
    for (const item of value) {
      const row = item && typeof item === "object" && !Array.isArray(item) ? item : {};
      lines.push(`  ${fields.map((field) => scalar(row[field])).join(",")}`);
    }
    return lines;
  }

  const keys = Object.keys(value);
  if (keys.length === 0) return [`${name}{}:`];

  if (keys.every((key) => typeof value[key] !== "object" || value[key] === null)) {
    return [`${name}{${keys.join(",")}}: ${keys.map((key) => scalar(value[key])).join(",")}`];
  }

  const lines = [`${name}:`];
  for (const key of keys) {
    for (const line of encodeNamed(key, value[key])) {
      lines.push(`  ${line}`);
    }
  }
  return lines;
}
