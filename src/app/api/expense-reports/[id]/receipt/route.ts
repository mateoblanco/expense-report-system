import { expenseReportsErrorResponseSchema } from "@/app/api/expense-reports/contract"
import { getErrorMessage, isAuthError } from "@/app/api/expense-reports/errorHelpers"
import { ExpenseReportLogic } from "@/server/logic/expenseReports/expenseReportLogic"
import { verifyAuthToken } from "@/server/services/firebase/auth"
import { downloadFile } from "@/server/services/firebase/storage"

export const runtime = "nodejs"

const getContentType = (fileName: string | null) => {
  const normalizedFileName = fileName?.toLowerCase() ?? ""

  if (normalizedFileName.endsWith(".pdf")) {
    return "application/pdf"
  }

  if (normalizedFileName.endsWith(".png")) {
    return "image/png"
  }

  if (normalizedFileName.endsWith(".jpg") || normalizedFileName.endsWith(".jpeg")) {
    return "image/jpeg"
  }

  return "application/octet-stream"
}

const toContentDispositionFileName = (fileName: string | null) => {
  return (fileName ?? "receipt").replace(/[^a-zA-Z0-9._-]/g, "-")
}

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const decodedToken = await verifyAuthToken(request)
    const { id } = await params
    const report = await ExpenseReportLogic.getExpenseReportById(id)

    if (!report) {
      return Response.json(
        expenseReportsErrorResponseSchema.parse({ error: "Expense report not found." }),
        { status: 404 },
      )
    }

    if (report.userId !== decodedToken.uid) {
      return Response.json(
        expenseReportsErrorResponseSchema.parse({ error: "Forbidden" }),
        { status: 403 },
      )
    }

    if (!report.receipt.storagePath) {
      return Response.json(
        expenseReportsErrorResponseSchema.parse({ error: "Receipt file not found." }),
        { status: 404 },
      )
    }

    const contentType = getContentType(report.receipt.fileName)
    const buffer = await downloadFile(report.receipt.storagePath)
    const body = Uint8Array.from(buffer)

    return new Response(
      body,
      {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${toContentDispositionFileName(report.receipt.fileName)}"`,
        "Cache-Control": "private, max-age=300",
      },
      },
    )
  } catch (error) {
    if (isAuthError(error)) {
      return Response.json(
        expenseReportsErrorResponseSchema.parse({ error: "Unauthorized" }),
        { status: 401 },
      )
    }

    return Response.json(
      expenseReportsErrorResponseSchema.parse({ error: getErrorMessage(error, "Failed to get receipt file.") }),
      { status: 500 },
    )
  }
}
