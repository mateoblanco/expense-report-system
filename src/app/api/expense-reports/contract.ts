import { z } from "zod"

export const expenseReportsErrorResponseSchema = z.object({
  error: z.string(),
})

export const expenseReportsSuccessResponseSchema = z.object({
  createdIds: z.array(z.string()),
})

export type ExpenseReportsSuccessResponse = z.infer<typeof expenseReportsSuccessResponseSchema>

export const getExpenseReportsResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      status: z.string(),
      receiptUrl: z.string().nullable(),
    }),
  ),
})

export type GetExpenseReportsResponse = z.infer<typeof getExpenseReportsResponseSchema>
