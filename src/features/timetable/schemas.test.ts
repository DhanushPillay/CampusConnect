import { describe, expect, it } from "vitest";
import { entrySchema } from "./schemas";
describe("timetable schemas", () => {
  const base = { dayOfWeek: "MONDAY", startTime: "09:00", endTime: "10:00", classId: "c", subjectId: "s", teacherId: "t" };
  it("accepts valid entry", () => { expect(entrySchema.safeParse(base).success).toBe(true); });
  it("rejects bad day, time and inverted range", () => {
    expect(entrySchema.safeParse({ ...base, dayOfWeek: "FUNDAY" }).success).toBe(false);
    expect(entrySchema.safeParse({ ...base, startTime: "9:00" }).success).toBe(false);
    expect(entrySchema.safeParse({ ...base, startTime: "11:00", endTime: "10:00" }).success).toBe(false);
  });
});
