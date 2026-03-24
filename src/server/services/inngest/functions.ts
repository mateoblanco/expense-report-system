import { get } from "@vercel/blob";
import { generateText, Output } from "ai";

import { TEST_WORKFLOW_EVENT_NAME } from "./events";
import { inngest } from "./client";
import {
  extractInvoiceNumberEventDataSchema,
  invoiceExtractionSchema,
} from "./schemas";

const invoiceExtractionSystemPrompt =
  "You extract the invoice number from invoice documents. Return only the structured data that matches the schema. If the invoice number cannot be found, return null.";

export const extractInvoiceNumber = inngest.createFunction(
  {
    id: "extract-invoice-number",
    triggers: [{ event: TEST_WORKFLOW_EVENT_NAME }],
  },
  async ({ event, step }) => {
    const payload = extractInvoiceNumberEventDataSchema.parse(event.data);

    const extraction = await step.run("extract-invoice-number", async () => {
      if (!process.env.AI_GATEWAY_API_KEY) {
        throw new Error("AI_GATEWAY_API_KEY is not configured.");
      }

      const blobResponse = await get(payload.blobPathname, {
        access: "private",
      });

      if (!blobResponse || blobResponse.statusCode !== 200 || !blobResponse.stream) {
        throw new Error(`Could not download blob ${payload.blobPathname}.`);
      }

      const fileBuffer = await new Response(blobResponse.stream).arrayBuffer();
      const fileData = new Uint8Array(fileBuffer);

      const { output } = await generateText({
        model: "openai/gpt-4.1",
        output: Output.object({
          schema: invoiceExtractionSchema,
        }),
        temperature: 0,
        system: invoiceExtractionSystemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract the invoice number from this document. If you cannot find it, return null.",
              },
              {
                type: "file",
                data: fileData,
                filename: payload.fileName,
                mediaType: payload.contentType,
              },
            ],
          },
        ],
      });

      return output;
    });

    await step.run("log-extraction-result", async () => {
      console.log("Invoice extraction result", {
        requestId: payload.requestId,
        fileName: payload.fileName,
        blobPathname: payload.blobPathname,
        blobUrl: payload.blobUrl,
        extraction,
      });
    });

    return extraction;
  },
);
