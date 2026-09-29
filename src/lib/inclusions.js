// Inclusion lists are free-text bullet items ("what the price covers" /
// "extra charges"). Stored as jsonb string arrays; edited as one-per-line text.
const MAX_ITEMS = 30;

export function parseInclusions(input) {
  const text = Array.isArray(input) ? input.join("\n") : String(input ?? "");
  const seen = new Set();
  const out = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || seen.has(line)) continue;
    seen.add(line);
    out.push(line);
    if (out.length >= MAX_ITEMS) break;
  }
  return out;
}

export function formatInclusions(input) {
  if (Array.isArray(input)) return input.join("\n");
  return String(input ?? "");
}
