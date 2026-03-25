import { z } from "zod"

export const expenseReportsErrorResponseSchema = z.object({
  error: z.string(),
})

export const expenseReportsSuccessResponseSchema = z.object({
  createdIds: z.array(z.string()),
})

export type ExpenseReportsSuccessResponse = z.infer<typeof expenseReportsSuccessResponseSchema>

const expenseReportListItemSchema = z.object({
  id: z.string(),
  status: z.enum(["processing", "completed", "failed"]),
  confidence: z.number().nullable(),
  receiptUrl: z.string().nullable(),
  invoiceNumber: z.string().nullable(),
  description: z.string().nullable(),
  amount: z.number().nullable(),
  currency: z.string().nullable(),
  category: z.string().nullable(),
  expenseDate: z.string().nullable(),
  vendorName: z.string().nullable(),
  additionalNotes: z.string().nullable(),
  subtotal: z.number().nullable(),
  taxAmount: z.number().nullable(),
  dueDate: z.string().nullable(),
  vendorTaxId: z.string().nullable(),
})

export const getExpenseReportsResponseSchema = z.object({
  data: z.array(expenseReportListItemSchema),
})

export type GetExpenseReportsResponse = z.infer<typeof getExpenseReportsResponseSchema>
