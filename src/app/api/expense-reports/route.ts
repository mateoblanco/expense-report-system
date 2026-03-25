import { z } from "zod"
import { ExpenseReportLogic } from "@/server/logic/expenseReports/expenseReportLogic"
import { getSignedUrl } from "@/server/services/firebase/storage"
import {
  expenseReportsSuccessResponseSchema,
  getExpenseReportsResponseSchema,
} from "@/app/api/expense-reports/contract"
import { verifyAuthToken } from "@/server/services/firebase/auth"

export const runtime = "nodejs"

const allowedUploadMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const

const maxUploadSizeBytes = 10 * 1024 * 1024

const uploadFileMetadataSchema = z.object({
  name: z.string().min(1, "The file name is required."),
  type: z.enum(allowedUploadMimeTypes, {
    error: "Only PDF, JPG, and PNG files are allowed.",
  }),
  size: z
    .number()
    .int()
    .positive("The file is empty.")
    .max(maxUploadSizeBytes, "The file must be 10 MB or smaller."),
})

export const GET = async (request: Request) => {
  try {
    const decodedToken = await verifyAuthToken(request)
    const reports = await ExpenseReportLogic.getExpenseReportsByUserId(decodedToken.uid)
    const data = await Promise.all(
      reports.map(async (r) => ({
        id: r.id,
        status: r.status,
        receiptUrl:
          r.status === "failed" || !r.receipt.storagePath
            ? null
            : await getSignedUrl(r.receipt.storagePath),
      }))
    )
    return Response.json(getExpenseReportsResponseSchema.parse({ data }))
  } catch (error) {
    if (isAuthError(error)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    return Response.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

export const POST = async (request: Request) => {
  try {
    const decodedToken = await verifyAuthToken(request)
    const formData = await request.formData()
    const fileEntries = formData.getAll("files")

    if (fileEntries.length === 0) {
      return Response.json(
        { error: "At least one file is required." },
        { status: 400 },
      )
    }

    const files: { name: string; type: string; size: number; buffer: Buffer }[] = []

    for (const entry of fileEntries) {
      if (!(entry instanceof File)) {
        return Response.json(
          { error: "Invalid file entry." },
          { status: 400 },
        )
      }

      const fileMetadata = uploadFileMetadataSchema.parse({
        name: entry.name,
        type: entry.type,
        size: entry.size,
      })

      const buffer = Buffer.from(await entry.arrayBuffer())
      files.push({ name: fileMetadata.name, type: fileMetadata.type, size: fileMetadata.size, buffer })
    }

    const createdIds = await ExpenseReportLogic.createExpenseReports({
      userId: decodedToken.uid,
      files,
    })

    if (createdIds.length === 0) {
      return Response.json(
        { error: "Failed to create expense reports." },
        { status: 500 },
      )
    }

    return Response.json(
      expenseReportsSuccessResponseSchema.parse({ createdIds }),
      { status: 200 },
    )
  } catch (error) {
    console.error("Failed to create expense reports.", error)

    if (isAuthError(error)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (error instanceof z.ZodError) {
      return Response.json(
        {
          error: error.issues[0]?.message ?? "Invalid request data.",
        },
        { status: 400 },
      )
    }

    return Response.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    )
  }
}

const isAuthError = (error: unknown) =>
  error instanceof Error &&
  ("code" in error && typeof (error as Record<string, unknown>).code === "string"
    ? ((error as Record<string, unknown>).code as string).startsWith("auth/")
    : error.message === "Missing or invalid Authorization header")

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return "Failed to create expense reports."
}
