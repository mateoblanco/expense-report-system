import { z } from "zod";

export const extractInvoiceNumberEventDataSchema = z.object({
  requestId: z.uuid(),
  blobPathname: z.string().min(1),
  blobUrl: z.url(),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().nonnegative(),
});

export const invoiceExtractionSchema = z.object({
  invoiceNumber: z.string().nullable(),
});

export type ExtractInvoiceNumberEventData = z.infer<
  typeof extractInvoiceNumberEventDataSchema
>;
