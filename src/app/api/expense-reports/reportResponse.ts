import { getSignedUrl } from "@/server/services/firebase/storage"
import type { ExpenseReport } from "@/types"
import type { ExpenseReportListItem } from "./contract"

export const toExpenseReportListItem = async (report: ExpenseReport): Promise<ExpenseReportListItem> => ({
  id: report.id,
  status: report.status,
  confidence: report.confidence,
  receiptUrl: !report.receipt.storagePath ? null : await getSignedUrl(report.receipt.storagePath),
  invoiceNumber: report.fields.invoiceNumber,
  description: report.fields.description,
  amount: report.fields.amount,
  currency: report.fields.currency,
  category: report.fields.category,
  expenseDate: report.fields.expenseDate,
  vendorName: report.fields.vendorName,
  additionalNotes: report.fields.additionalNotes,
  subtotal: report.fields.subtotal,
  taxAmount: report.fields.taxAmount,
  dueDate: report.fields.dueDate,
  vendorTaxId: report.fields.vendorTaxId,
})
