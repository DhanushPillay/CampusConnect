import { describe, expect, it } from "vitest";
import { attendanceStatus, gradeLetter, getWeekdays } from "../../prisma/seed-helpers";

describe("seed helpers", () => {
  it("returns the requested number of weekdays ending on or before the given date", () => {
    const days = getWeekdays(new Date("2026-11-01T00:00:00.000Z"), 30);

    expect(days).toHaveLength(30);
    expect(days.every((day) => day.getUTCDay() > 0 && day.getUTCDay() < 6)).toBe(true);
    expect(days[days.length - 1].toISOString()).toBe("2026-10-30T00:00:00.000Z");
  });

  it("produces stable attendance and grade values", () => {
    expect(attendanceStatus(7, 3, 5)).toBe(attendanceStatus(7, 3, 5));
    expect(["PRESENT", "LATE", "ABSENT"]).toContain(attendanceStatus(7, 3, 5));
    expect(gradeLetter(95)).toBe("A");
    expect(gradeLetter(76)).toBe("B");
    expect(gradeLetter(61)).toBe("C");
    expect(gradeLetter(40)).toBe("D");
    expect(gradeLetter(39)).toBe("F");
  });
});
