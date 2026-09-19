import { describe, expect, it } from "vitest";
import { amountSchema, paymentSchema } from "./schemas";
describe("fees schemas", () => {
  it("rejects zero and negative amounts", () => {
    expect(amountSchema.safeParse(0).success).toBe(false);
    expect(paymentSchema.safeParse({ invoiceId: "i", amount: -5, method: "CASH" }).success).toBe(false);
    expect(paymentSchema.safeParse({ invoiceId: "i", amount: 100, method: "CASH" }).success).toBe(true);
  });
});
