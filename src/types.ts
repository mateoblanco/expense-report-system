export type ExpenseReport = {
  id: string
  userId: string | null
  status: "processing" | "completed" | "failed",
  confidence: number | null

  fields: {
    invoiceNumber: string | null,
    description: string | null,
    amount: number | null,
    currency: string | null,
    category: string | null,
    expenseDate: string | null,
    vendorName: string | null,
    additionalNotes: string | null,
    subtotal: number | null
    taxAmount: number | null
    dueDate: string | null
    vendorTaxId: string | null
  },

  receipt: {
    storagePath: string,
    fileName: string,
  },

  extraction: {
    provider: string | null,
    raw: Record<string, unknown> | null,
    error: string | null,
    processedAt: string | null,
  },

  createdAt: string,
  updatedAt: string
}

export type CreateExpenseReportData = Omit<ExpenseReport, "id" | "createdAt" | "updatedAt">

export type ExpenseReportFieldValues = ExpenseReport["fields"]
export type ExpenseReportFieldKey = keyof ExpenseReportFieldValues
