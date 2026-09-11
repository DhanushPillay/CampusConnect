"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { payFee } from "@/lib/actions/student";
import { formatINR } from "@/lib/utils";

export function PayFeeDialog({
  invoiceId,
  remaining,
  studentLabel,
}: {
  invoiceId: string;
  remaining: number;
  studentLabel: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(remaining));
  const [method, setMethod] = useState("CASH");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const value = Number(amount);
      await payFee(invoiceId, value, method);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Pay</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Pay fee</DialogTitle>
        <DialogDescription>
          {studentLabel} · remaining {formatINR(remaining)}
        </DialogDescription>
        <form onSubmit={handlePay} className="mt-4 space-y-3">
          <div>
            <label htmlFor={`amount-${invoiceId}`} className="text-sm font-medium text-ink">
              Amount
            </label>
            <Input
              id={`amount-${invoiceId}`}
              type="number"
              min={1}
              max={remaining}
              step="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`method-${invoiceId}`} className="text-sm font-medium text-ink">
              Method
            </label>
            <select
              id={`method-${invoiceId}`}
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-1 flex h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-ink"
            >
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
              <option value="NETBANKING">Netbanking</option>
            </select>
          </div>
          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Processing…" : `Pay ${formatINR(Number(amount) || 0)}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
