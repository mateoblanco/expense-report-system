import { ExpenseReport, UpdateExpenseReportRequest } from "@/app/api/expense-reports/contract"

type EditableFieldKey = keyof UpdateExpenseReportRequest

export type FormState = Record<EditableFieldKey, string>

export const getInitialFormState = (report: ExpenseReport): FormState => ({
    invoiceNumber: report.invoiceNumber ?? "",
    description: report.description ?? "",
    amount: report.amount?.toString() ?? "",
    currency: report.currency ?? "",
    category: report.category ?? "",
    expenseDate: report.expenseDate ?? "",
    vendorName: report.vendorName ?? "",
    additionalNotes: report.additionalNotes ?? "",
    subtotal: report.subtotal?.toString() ?? "",
    taxAmount: report.taxAmount?.toString() ?? "",
    dueDate: report.dueDate ?? "",
    vendorTaxId: report.vendorTaxId ?? "",
})

export const getFormPayload = (
    formState: FormState,
): UpdateExpenseReportRequest => {
    return {
        invoiceNumber: normalizeTextValue(formState.invoiceNumber),
        description: normalizeTextValue(formState.description),
        amount: normalizeNumberValue(formState.amount),
        currency: normalizeTextValue(formState.currency),
        category: normalizeTextValue(formState.category),
        expenseDate: normalizeTextValue(formState.expenseDate),
        vendorName: normalizeTextValue(formState.vendorName),
        additionalNotes: normalizeTextValue(formState.additionalNotes),
        subtotal: normalizeNumberValue(formState.subtotal),
        taxAmount: normalizeNumberValue(formState.taxAmount),
        dueDate: normalizeTextValue(formState.dueDate),
        vendorTaxId: normalizeTextValue(formState.vendorTaxId),
    }
}

const normalizeTextValue = (rawValue: string) => {
    return rawValue === "" ? null : rawValue
}

const normalizeNumberValue = (rawValue: string) => {
    if (rawValue === "") {
        return null
    }

    const parsedValue = Number(rawValue)
    return Number.isNaN(parsedValue) ? null : parsedValue
}