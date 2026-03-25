import { EXPENSE_REPORT_EXTRACT_DATA_EVENT } from "../events"
import { inngest } from "../client"
import { extractExpenseReportDataEventSchema } from "../schemas"
import { downloadFile } from "@/server/services/firebase/storage"
import { ExpenseReportLogic } from "@/server/logic/expenseReports/expenseReportLogic"
import { extractDataFromFile } from "@/server/logic/expenseReports/dataExtraction/extractDataFromFile"
import { DataExtractionConfig } from "@/server/logic/expenseReports/dataExtraction/config"


export const extractExpenseReportData = inngest.createFunction(
  {
    id: "extract-expense-report-data",
    triggers: [{ event: EXPENSE_REPORT_EXTRACT_DATA_EVENT }],
  },
  async ({ event, step }) => {
    const payload = extractExpenseReportDataEventSchema.parse(event.data)

    try {
      const extraction = await step.run("extract-data-from-file", async () => {
        const buffer = await downloadFile(payload.storagePath)
        return extractDataFromFile({
          buffer,
          fileName: payload.fileName,
          contentType: payload.contentType,
        })
      })

      await step.run("persist-extraction", async () => {
        await ExpenseReportLogic.updateExpenseReportExtraction(payload.expenseReportId, {
          status: "completed",
          fields: {
            invoiceNumber: { value: extraction.invoiceNumber.value, confidence: extraction.invoiceNumber.confidence },
            description: { value: extraction.description.value, confidence: extraction.description.confidence },
            amount: { value: extraction.amount.value, confidence: extraction.amount.confidence },
            currency: { value: extraction.currency.value, confidence: extraction.currency.confidence },
            category: { value: extraction.category.value, confidence: extraction.category.confidence },
            expenseDate: { value: extraction.expenseDate.value, confidence: extraction.expenseDate.confidence },
            vendorName: { value: extraction.vendorName.value, confidence: extraction.vendorName.confidence },
            additionalNotes: { value: extraction.additionalNotes.value, confidence: extraction.additionalNotes.confidence },
            subtotal: { value: extraction.subtotal.value, confidence: extraction.subtotal.confidence },
            taxAmount: { value: extraction.taxAmount.value, confidence: extraction.taxAmount.confidence },
            dueDate: { value: extraction.dueDate.value, confidence: extraction.dueDate.confidence },
            vendorTaxId: { value: extraction.vendorTaxId.value, confidence: extraction.vendorTaxId.confidence },
          },
          extraction: {
            provider: DataExtractionConfig.model as string,
            raw: extraction as unknown as Record<string, unknown>,
            error: null,
            processedAt: new Date().toISOString(),
          },
        })
      })

      return extraction
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Expense report extraction failed."

      await step.run("mark-extraction-failed", async () => {
        await ExpenseReportLogic.markExpenseReportAsFailed(
          payload.expenseReportId,
          errorMessage,
          DataExtractionConfig.model as string,
        )
      })

      throw error
    }
  },
)
