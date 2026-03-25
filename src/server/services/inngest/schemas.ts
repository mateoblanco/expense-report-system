import { z } from "zod"

export const extractExpenseReportDataEventSchema = z.object({
  expenseReportId: z.string().min(1),
  storagePath: z.string().min(1),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().nonnegative(),
})

export type ExtractExpenseReportDataEvent = z.infer<
  typeof extractExpenseReportDataEventSchema
>
