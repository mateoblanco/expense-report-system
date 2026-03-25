import { z } from "zod"

export const expenseReportsErrorResponseSchema = z.object({
  error: z.string(),
})

export const expenseReportsSuccessResponseSchema = z.object({
  createdIds: z.array(z.string()),
})

export type ExpenseReportsSuccessResponse = z.infer<typeof expenseReportsSuccessResponseSchema>

const editableExpenseReportFieldSchemas = {
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
}

export const expenseReportListItemSchema = z.object({
  id: z.string(),
  status: z.enum(["processing", "completed", "failed"]),
  confidence: z.number().nullable(),
  receiptUrl: z.string().nullable(),
  ...editableExpenseReportFieldSchemas,
})

export const getExpenseReportsResponseSchema = z.object({
  data: z.array(expenseReportListItemSchema),
})

export type GetExpenseReportsResponse = z.infer<typeof getExpenseReportsResponseSchema>
export type ExpenseReportListItem = z.infer<typeof expenseReportListItemSchema>

export const updateExpenseReportRequestSchema = z.object(editableExpenseReportFieldSchemas)

export type UpdateExpenseReportRequest = z.infer<typeof updateExpenseReportRequestSchema>

export const updateExpenseReportResponseSchema = expenseReportListItemSchema

export type UpdateExpenseReportResponse = z.infer<typeof updateExpenseReportResponseSchema>
