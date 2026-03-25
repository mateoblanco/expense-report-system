import { serve } from "inngest/next"
import { inngest } from "@/server/services/inngest/client"
import { extractExpenseReportData } from "@/server/services/inngest/functions/extractExpenseReportData"

export const runtime = "nodejs"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [extractExpenseReportData],
})
