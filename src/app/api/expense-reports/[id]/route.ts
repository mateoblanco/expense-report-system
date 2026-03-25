import { z } from "zod"
import {
  expenseReportsErrorResponseSchema,
  updateExpenseReportRequestSchema,
  updateExpenseReportResponseSchema,
} from "@/app/api/expense-reports/contract"
import { getErrorMessage, isAuthError } from "@/app/api/expense-reports/errorHelpers"
import { toExpenseReportListItem } from "@/app/api/expense-reports/reportResponse"
import { ExpenseReportLogic } from "@/server/logic/expenseReports/expenseReportLogic"
import { verifyAuthToken } from "@/server/services/firebase/auth"

export const runtime = "nodejs"

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const decodedToken = await verifyAuthToken(request)
    const { id } = await params
    const existingReport = await ExpenseReportLogic.getExpenseReportById(id)

    if (!existingReport) {
      return Response.json(
        expenseReportsErrorResponseSchema.parse({ error: "Expense report not found." }),
        { status: 404 },
      )
    }

    if (existingReport.userId !== decodedToken.uid) {
      return Response.json(
        expenseReportsErrorResponseSchema.parse({ error: "Forbidden" }),
        { status: 403 },
      )
    }

    const payload = updateExpenseReportRequestSchema.parse(await request.json())
    const updatedReport = await ExpenseReportLogic.updateExpenseReportFields(id, payload)

    if (!updatedReport) {
      return Response.json(
        expenseReportsErrorResponseSchema.parse({ error: "Expense report not found." }),
        { status: 404 },
      )
    }

    return Response.json(
      updateExpenseReportResponseSchema.parse(await toExpenseReportListItem(updatedReport)),
      { status: 200 },
    )
  } catch (error) {
    if (isAuthError(error)) {
      return Response.json(
        expenseReportsErrorResponseSchema.parse({ error: "Unauthorized" }),
        { status: 401 },
      )
    }

    if (error instanceof SyntaxError || error instanceof z.ZodError) {
      return Response.json(
        expenseReportsErrorResponseSchema.parse({
          error: error instanceof z.ZodError
            ? error.issues[0]?.message ?? "Invalid request data."
            : "Invalid request body.",
        }),
        { status: 400 },
      )
    }

    return Response.json(
      expenseReportsErrorResponseSchema.parse({ error: getErrorMessage(error, "Failed to update expense report.") }),
      { status: 500 },
    )
  }
}
