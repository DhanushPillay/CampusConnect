import { describe, expect, it } from "vitest";
import { paidAmount, remainingAmount } from "./fees";

describe("fee balances", () => {
  it("subtracts completed payments from the invoice amount", () => {
    const invoice = { amount: 1000, payments: [{ amount: 250 }, { amount: 250 }] };
    expect(paidAmount(invoice)).toBe(500);
    expect(remainingAmount(invoice)).toBe(500);
  });

  it("never returns a negative balance", () => {
    expect(remainingAmount({ amount: 100, payments: [{ amount: 150 }] })).toBe(0);
  });
});
