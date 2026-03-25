import { generateText, Output } from "ai"
import { EXTRACT_DATA_FROM_FILE_PROMPT } from "./prompt"
import { DataExtractionConfig } from "./config"
import { InvoiceExtractionResult, invoiceExtractionSchema } from "./schema"



export const extractDataFromFile = async (params: {
  buffer: Buffer
  fileName: string
  contentType: string
}): Promise<InvoiceExtractionResult> => {
  const fileData = new Uint8Array(params.buffer)

  const { output } = await generateText({
    model: DataExtractionConfig.model,
    temperature: DataExtractionConfig.temperature,
    output: Output.object({
      schema: invoiceExtractionSchema,
    }),
    system: EXTRACT_DATA_FROM_FILE_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract structured expense-report data from this document.",
          },
          {
            type: "file",
            data: fileData,
            filename: params.fileName,
            mediaType: params.contentType,
          },
        ],
      },
    ],
  })

  return output ?? { invoiceNumber: null }
}
