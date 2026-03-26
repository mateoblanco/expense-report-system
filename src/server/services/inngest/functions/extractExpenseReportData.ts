import { EXPENSE_REPORT_EXTRACT_DATA_EVENT } from "../events"
import { inngest } from "../client"
import { extractExpenseReportDataEventSchema } from "../schemas"
import { downloadFile } from "@/server/services/firebase/storage"
import { ExpenseReportLogic, getAverageConfidence } from "@/server/logic/expenseReports/expenseReportLogic"
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
          confidence: getAverageConfidence(extraction),
          fields: {
            invoiceNumber: extraction.invoiceNumber.value,
            description: extraction.description.value,
            amount: extraction.amount.value,
            currency: extraction.currency.value,
            category: extraction.category.value,
            expenseDate: extraction.expenseDate.value,
            vendorName: extraction.vendorName.value,
            additionalNotes: extraction.additionalNotes.value,
            subtotal: extraction.subtotal.value,
            taxAmount: extraction.taxAmount.value,
            dueDate: extraction.dueDate.value,
            vendorTaxId: extraction.vendorTaxId.value,
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
