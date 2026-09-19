import { describe, expect, it } from "vitest";
import { createAssignmentSchema, gradeSchema } from "./schemas";
describe("assignments schemas", () => {
  it("rejects zero marks and negative grades", () => {
    expect(createAssignmentSchema.safeParse({ title: "T", description: "", subjectId: "s", teacherId: "t", deadline: new Date(), maxMarks: 0 }).success).toBe(false);
    expect(gradeSchema.safeParse({ id: "i", marks: -1, feedback: "", graderId: "g" }).success).toBe(false);
  });
});
