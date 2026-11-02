import { describe, expect, it } from "vitest";
import { dateOnly, endOfDate, normalizeTime } from "./date";

describe("date helpers", () => {
  it("normalizes calendar dates to UTC midnight", () => {
    expect(dateOnly("2026-10-28").toISOString()).toBe("2026-10-28T00:00:00.000Z");
    expect(dateOnly(new Date("2026-10-28T23:30:00.000Z")).toISOString()).toBe(
      "2026-10-28T00:00:00.000Z"
    );
  });

  it("rejects impossible dates", () => {
    expect(() => dateOnly("2026-02-30")).toThrow("Invalid date");
    expect(() => dateOnly("28-10-2026")).toThrow("Invalid date");
  });

  it("covers the full UTC day", () => {
    expect(endOfDate("2026-10-28").toISOString()).toBe("2026-10-28T23:59:59.999Z");
  });

  it("normalizes and validates clock times", () => {
    expect(normalizeTime("9:05")).toBe("09:05");
    expect(normalizeTime("23:59")).toBe("23:59");
    expect(() => normalizeTime("24:00")).toThrow("Invalid time");
    expect(() => normalizeTime("9:60")).toThrow("Invalid time");
  });
});
