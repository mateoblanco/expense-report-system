type Field<T> = {
  value: T | null
  confidence: number | null
}

export type ExpenseReport = {
  id: string
  userId: string | null
  status: "processing" | "completed" | "failed",

  fields: {
    invoiceNumber: Field<string> | null,
    description: Field<string> | null,
    amount: Field<number> | null,
    currency: Field<string> | null,
    category: Field<string> | null,
    expenseDate: Field<string> | null,
    vendorName: Field<string> | null,
    additionalNotes: Field<string> | null,
    subtotal: Field<number> | null
    taxAmount: Field<number> | null
    dueDate: Field<string> | null
    vendorTaxId: Field<string> | null
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
