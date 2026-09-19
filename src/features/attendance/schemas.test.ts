import { describe, expect, it } from "vitest";
import { bulkMarkSchema } from "./schemas";
describe("attendance schemas", () => {
  it("rejects bad status and empty rows", () => {
    const r = (rows: { studentId: string; status: string }[]) => bulkMarkSchema.safeParse({ classId: "c", subjectId: "s", date: new Date(), markedById: "m", rows });
    expect(r([{ studentId: "x", status: "PRESENT" }]).success).toBe(true);
    expect(r([{ studentId: "x", status: "MAYBE" }]).success).toBe(false);
    expect(r([]).success).toBe(false);
  });
});
