import { test } from "node:test";
import assert from "node:assert/strict";
import { subcategoriesByParent } from "../src/lib/subcategories.js";

const rows = [
  { id: "1", name: "Tutors", parent_id: null },
  { id: "2", name: "Doctors", parent_id: null },
  { id: "3", name: "Dance Tutor", parent_id: "1" },
  { id: "4", name: "Maths Tutor", parent_id: "1" },
  { id: "5", name: "Dentist", parent_id: "2" },
  { id: "6", name: "Orphan", parent_id: "missing" },
];

test("groups children under their parent name", () => {
  assert.deepEqual(subcategoriesByParent(rows), {
    Tutors: ["Dance Tutor", "Maths Tutor"],
    Doctors: ["Dentist"],
  });
});

test("top-level categories are not keys and unknown parents are skipped", () => {
  const map = subcategoriesByParent(rows);
  assert.equal(map.Tutors.includes("Tutors"), false);
  assert.equal("undefined" in map, false);
  assert.equal(Object.values(map).flat().includes("Orphan"), false);
});

test("handles empty and invalid input", () => {
  assert.deepEqual(subcategoriesByParent(), {});
  assert.deepEqual(subcategoriesByParent(null), {});
});
