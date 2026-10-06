import assert from "node:assert";
import {
  parseTimeMinutes,
  formatTime24to12,
  generateSlotsForDay,
  isWorkingDay,
  getAvailableSlots,
} from "../src/lib/data/bookings.js";

console.log("Running Working Hours UI & Schedule Tests...");

// 1. Mon 9 to 5 (09:00 to 17:00)
const monConfig = {
  enabled: true,
  startTime: "09:00",
  endTime: "17:00",
  break: { enabled: false, start: "13:00", end: "14:00" },
};
const monSlots = generateSlotsForDay(monConfig);
console.log("Mon (09:00 - 17:00) slots:", monSlots);
assert.deepStrictEqual(monSlots, [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
]);
// Verify last slot is 2 hours before 17:00 (15:00 = 3:00 PM)
assert.strictEqual(monSlots[monSlots.length - 1], "03:00 PM");

// 2. Tue off
const tueConfig = {
  enabled: false,
  startTime: "09:00",
  endTime: "17:00",
};
const tueSlots = generateSlotsForDay(tueConfig);
console.log("Tue (Closed) slots:", tueSlots);
assert.deepStrictEqual(tueSlots, []);

// 3. Wed 12 to 8 (12:00 to 20:00)
const wedConfig = {
  enabled: true,
  startTime: "12:00",
  endTime: "20:00",
  break: { enabled: false },
};
const wedSlots = generateSlotsForDay(wedConfig);
console.log("Wed (12:00 - 20:00) slots:", wedSlots);
assert.deepStrictEqual(wedSlots, [
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
]);
// Verify last slot is 2 hours before 20:00 (18:00 = 6:00 PM)
assert.strictEqual(wedSlots[wedSlots.length - 1], "06:00 PM");

// 4. Optional break test (Wed with break 14:00 - 15:00)
const wedBreakConfig = {
  enabled: true,
  startTime: "12:00",
  endTime: "20:00",
  break: { enabled: true, start: "14:00", end: "15:00" },
};
const wedBreakSlots = generateSlotsForDay(wedBreakConfig);
console.log("Wed with break (14:00-15:00) slots:", wedBreakSlots);
assert.ok(!wedBreakSlots.includes("02:00 PM"));
assert.ok(wedBreakSlots.includes("01:00 PM"));
assert.ok(wedBreakSlots.includes("03:00 PM"));

// 5. Full saved schedule object test
const savedSchedule = {
  daily: {
    Monday: monConfig,
    Tuesday: tueConfig,
    Wednesday: wedConfig,
    Thursday: { enabled: false },
    Friday: { enabled: false },
    Saturday: { enabled: false },
    Sunday: { enabled: false },
  },
  days: ["Monday", "Wednesday"],
  hours: "Mon 09:00 AM - 05:00 PM, Wed 12:00 PM - 08:00 PM",
  slots: [...monSlots, ...wedSlots],
};

// Test isWorkingDay for saved schedule
// 2026-10-12 is Monday
assert.strictEqual(isWorkingDay("2026-10-12", savedSchedule), true);
// 2026-10-13 is Tuesday (off)
assert.strictEqual(isWorkingDay("2026-10-13", savedSchedule), false);
// 2026-10-14 is Wednesday
assert.strictEqual(isWorkingDay("2026-10-14", savedSchedule), true);
// 2026-10-15 is Thursday (off)
assert.strictEqual(isWorkingDay("2026-10-15", savedSchedule), false);

// 6. Test getAvailableSlots with mock Supabase or direct availability
async function testSlots() {
  const monAvailSlots = await getAvailableSlots(null, "2026-10-12", savedSchedule);
  assert.deepStrictEqual(monAvailSlots, monSlots);

  const tueAvailSlots = await getAvailableSlots(null, "2026-10-13", savedSchedule);
  assert.deepStrictEqual(tueAvailSlots, []);

  const wedAvailSlots = await getAvailableSlots(null, "2026-10-14", savedSchedule);
  assert.deepStrictEqual(wedAvailSlots, wedSlots);

  // 7. Simulating edit without saving:
  // User edits Tuesday to be enabled in their draft state
  const draftSchedule = JSON.parse(JSON.stringify(savedSchedule));
  draftSchedule.daily.Tuesday = { enabled: true, startTime: "09:00", endTime: "17:00" };

  // The public form queries the saved schedule (from DB/prop):
  const publicTueSlots = await getAvailableSlots(null, "2026-10-13", savedSchedule);
  // Stored schedule is untouched! Public form remains closed for Tuesday.
  assert.deepStrictEqual(publicTueSlots, []);

  console.log("All working hours UI and slot tests passed successfully!");
}

testSlots();
