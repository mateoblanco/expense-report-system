import { ExpenseReportsRepository } from "@/server/dataRepository/expenseReports"
import { uploadFile, deleteFile, getInvoicesStoragePath } from "@/server/services/firebase/storage"
import { inngest } from "@/server/services/inngest/client"
import { EXPENSE_REPORT_EXTRACT_DATA_EVENT } from "@/server/services/inngest/events"
import { ExpenseReport, type ExpenseReportFieldValues } from "@/types"
import type { InvoiceExtractionResult } from "./dataExtraction/schema"
import pLimit from "p-limit"
import { getErrorMessage } from "../helpers"

const emptyExpenseReportFields: ExpenseReport["fields"] = {
  invoiceNumber: null,
  description: null,
  amount: null,
  currency: null,
  category: null,
  expenseDate: null,
  vendorName: null,
  additionalNotes: null,
  subtotal: null,
  taxAmount: null,
  dueDate: null,
  vendorTaxId: null,
}

const deleteExpenseReport = async (id: string): Promise<void> => {
  const report = await ExpenseReportsRepository.findExpenseReportById(id)
  if (!report) {
    throw new Error(`ExpenseReport ${id} not found.`)
  }
  await ExpenseReportsRepository.deleteExpenseReport(id)
}

const getExpenseReportsByUserId = async (userId: string): Promise<ExpenseReport[]> => {
  return ExpenseReportsRepository.findExpenseReportsByUserId(userId)
}

const getExpenseReportById = async (id: string): Promise<ExpenseReport | null> => {
  return ExpenseReportsRepository.findExpenseReportById(id)
}

const updateExpenseReportExtraction = async (
  id: string,
  data: Pick<ExpenseReport, "status" | "fields" | "extraction" | "confidence">,
): Promise<ExpenseReport | null> => {
  return ExpenseReportsRepository.updateExpenseReport(id, data)
}

const updateExpenseReportFields = async (
  id: string,
  data: ExpenseReportFieldValues,
): Promise<ExpenseReport | null> => {
  const currentReport = await ExpenseReportsRepository.findExpenseReportById(id)

  if (!currentReport) {
    return null
  }

  return ExpenseReportsRepository.updateExpenseReport(id, {
    fields: data,
    confidence: null,
  })
}

const markExpenseReportAsFailed = async (
  id: string,
  errorMessage: string,
  provider: string | null = null,
): Promise<ExpenseReport | null> => {
  return ExpenseReportsRepository.updateExpenseReport(id, {
    status: "failed",
    confidence: null,
    fields: emptyExpenseReportFields,
    extraction: {
      provider,
      raw: null,
      error: errorMessage,
      processedAt: new Date().toISOString(),
    },
  })
}

const processSingleExpenseReport = async (
  userId: string,
  file: { name: string; type: string; size: number; buffer: Buffer }
): Promise<{ expenseReportId: string; fileName: string }> => {

  let expenseReportId: string | null = null
  let storagePath: string | null = null
  let fileUploaded = false
  let receiptLinked = false

  try {

    const report = await ExpenseReportsRepository.createExpenseReport({
      userId,
      status: "processing",
      confidence: null,
      fields: emptyExpenseReportFields,
      receipt: {
        storagePath: "",
        fileName: file.name,
      },
      extraction: {
        provider: null,
        raw: null,
        error: null,
        processedAt: null,
      },
    })

    expenseReportId = report.id
    storagePath = getInvoicesStoragePath(expenseReportId, file.name)

    await uploadFile(storagePath, file.buffer, file.type)
    fileUploaded = true

    await ExpenseReportsRepository.updateExpenseReport(report.id, {
      receipt: {
        storagePath,
        fileName: file.name,
      },
    })
    receiptLinked = true

    await inngest.send({
      name: EXPENSE_REPORT_EXTRACT_DATA_EVENT,
      data: {
        expenseReportId: expenseReportId,
        storagePath,
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      },
    })

    return {
      expenseReportId: report.id,
      fileName: file.name,
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error)

    if (expenseReportId) {
      try {
        await markExpenseReportAsFailed(expenseReportId, errorMessage)
      } catch (updateError) {
        console.error(
          `Failed to mark expense report ${expenseReportId} as failed.`,
          updateError
        )
      }
    }

    if (fileUploaded && storagePath && !receiptLinked) {
      try {
        await deleteFile(storagePath)
      } catch (cleanupError) {
        console.error(`Failed to clean up file ${storagePath}.`, cleanupError)
      }
    }

    throw error
  }
}

type CreateExpenseReportsResult = {
  expenseReportId: string
  fileName: string
}

export const createExpenseReports = async (
  params: {
    userId: string
    files: Array<{ name: string; type: string; size: number; buffer: Buffer }>
  }
): Promise<string[]> => {

  const limit = pLimit(3)
  const results = await Promise.allSettled(
    params.files.map((file) =>
      limit(() => processSingleExpenseReport(params.userId, file))
    )
  )

  const successes: CreateExpenseReportsResult[] = []
  const failures: { fileName: string; error: string }[] = []


  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      successes.push(result.value)
      return
    } else {
      failures.push({
        fileName: params.files[index]?.name ?? "unknown",
        error: getErrorMessage(result.reason),
      })
      console.error(getErrorMessage(result.reason))
    }
  })

  return successes.map((result) => result.expenseReportId)
}

export const ExpenseReportLogic = {
  getExpenseReportById,
  updateExpenseReportExtraction,
  updateExpenseReportFields,
  markExpenseReportAsFailed,
  createExpenseReports,
  getExpenseReportsByUserId,
  deleteExpenseReport,
}

export const getAverageConfidence = (extraction: InvoiceExtractionResult) => {
  const confidences = Object.values(extraction)
    .map((field) => field.confidence)
    .filter((confidence): confidence is number => confidence !== null)

  if (confidences.length === 0) {
    return null
  }

  const average = confidences.reduce((total, confidence) => total + confidence, 0) / confidences.length
  return Number(average.toFixed(2))
}
