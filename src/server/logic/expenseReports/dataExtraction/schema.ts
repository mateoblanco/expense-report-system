import { z } from "zod"

const stringFieldSchema = z.object({
    value: z.string().nullable(),
    confidence: z.number().nullable(),
})

const numberFieldSchema = z.object({
    value: z.number().nullable(),
    confidence: z.number().nullable(),
})

export const invoiceExtractionSchema = z.object({
    invoiceNumber: stringFieldSchema,
    description: stringFieldSchema,
    amount: numberFieldSchema,
    currency: stringFieldSchema,
    category: stringFieldSchema,
    expenseDate: stringFieldSchema,
    vendorName: stringFieldSchema,
    additionalNotes: stringFieldSchema,
    subtotal: numberFieldSchema,
    taxAmount: numberFieldSchema,
    dueDate: stringFieldSchema,
    vendorTaxId: stringFieldSchema,
})

export type InvoiceExtractionResult = z.infer<typeof invoiceExtractionSchema>
