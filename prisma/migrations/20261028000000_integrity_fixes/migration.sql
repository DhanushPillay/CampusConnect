-- Prevent duplicate invoices for the same student and fee structure.
CREATE UNIQUE INDEX "FeeInvoice_studentId_feeStructureId_key"
ON "FeeInvoice"("studentId", "feeStructureId");
