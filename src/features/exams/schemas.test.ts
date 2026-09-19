import { describe, expect, it } from "vitest";
import { createExamSchema, questionSchema } from "./schemas";
describe("exams schemas", () => {
  it("requires 2+ options", () => {
    const q = { examId: "e", questionText: "Q", options: ["A"], correctOption: 0, marks: 5 };
    expect(questionSchema.safeParse(q).success).toBe(false);
    expect(questionSchema.safeParse({ ...q, options: ["A", "B"] }).success).toBe(true);
  });
  it("rejects empty exam name", () => {
    expect(createExamSchema.safeParse({ name: " ", subjectId: "s", totalMarks: 10, duration: 30, createdById: "t" }).success).toBe(false);
  });
});
