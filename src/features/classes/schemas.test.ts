import { describe, expect, it } from "vitest";
import { assignTeacherSchema, createSubjectSchema } from "./schemas";
describe("classes schemas", () => {
  it("uppercases subject code", () => {
    expect(createSubjectSchema.parse({ name: "N", code: "cs101", classId: "c" }).code).toBe("CS101");
  });
  it("rejects empty teacher", () => {
    expect(assignTeacherSchema.safeParse({ subjectId: "s", teacherId: "" }).success).toBe(false);
  });
});
