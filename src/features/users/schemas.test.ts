import { describe, expect, it } from "vitest";
import { createUserSchema } from "./schemas";
describe("users schemas", () => {
  it("accepts valid input", () => {
    expect(createUserSchema.safeParse({ name: "A", email: "a@x.edu", password: "secret1", role: "ADMIN" }).success).toBe(true);
  });
  it("rejects bad role and short password", () => {
    expect(createUserSchema.safeParse({ name: "A", email: "a@x.edu", password: "x", role: "NOPE" }).success).toBe(false);
  });
});
