export type InvoiceWithPayments = {
  amount: number;
  payments: { amount: number }[];
};

export function paidAmount(invoice: InvoiceWithPayments): number {
  return invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
}

export function remainingAmount(invoice: InvoiceWithPayments): number {
  return Math.max(0, invoice.amount - paidAmount(invoice));
}
