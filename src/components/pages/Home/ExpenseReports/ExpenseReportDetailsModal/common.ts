import { UpdateExpenseReportRequest } from "@/app/api/expense-reports/contract"

type EditableFieldKey = keyof UpdateExpenseReportRequest

export type FieldConfig = {
    key: EditableFieldKey
    label: string
    inputType: "text" | "number" | "textarea",
    size: "1-col" | "2-col"
}

export const detailFieldConfigs: FieldConfig[] = [
    { key: "invoiceNumber", label: "Invoice Number", inputType: "text",size:"1-col" },
    { key: "category", label: "Category", inputType: "text",size:"1-col" },
    { key: "expenseDate", label: "Expense Date", inputType: "text",size:"1-col" },
    { key: "dueDate", label: "Due Date", inputType: "text",size:"1-col" },
    { key: "vendorName", label: "Vendor Name", inputType: "text",size:"1-col" },
    { key: "vendorTaxId", label: "Vendor Tax ID", inputType: "text",size:"1-col" },
    { key: "description", label: "Description", inputType: "textarea",size:"2-col" },
]

export const amountFieldConfigs: FieldConfig[] = [
    { key: "subtotal", label: "Subtotal", inputType: "number",size:"2-col" },
    { key: "taxAmount", label: "Tax Amount", inputType: "number",size:"2-col" },
    { key: "amount", label: "Total", inputType: "number",size:"2-col" },
]

export const extraFieldConfigs: FieldConfig[] = [
    { key: "additionalNotes", label: "Additional Notes", inputType: "textarea",size:"2-col" },
]