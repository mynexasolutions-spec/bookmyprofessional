// Pure category-tree helpers (no imports) so they can be unit-tested with node:test.
// Rows are categories with { id, name, parent_id }; returns { parentName: [childName, ...] }.
export function subcategoriesByParent(rows = []) {
  const list = Array.isArray(rows) ? rows : [];
  const nameById = new Map(list.map((row) => [row.id, row.name]));
  const map = {};
  for (const row of list) {
    const parentName = row.parent_id ? nameById.get(row.parent_id) : null;
    if (!row.name || !parentName) continue;
    (map[parentName] ||= []).push(row.name);
  }
  return map;
}
