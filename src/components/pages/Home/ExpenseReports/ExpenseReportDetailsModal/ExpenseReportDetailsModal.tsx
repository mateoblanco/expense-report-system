import { useState } from "react"
import Modal from "@/components/base/Modal/Modal"
import type {
    GetExpenseReportsResponse,
    UpdateExpenseReportRequest,
    UpdateExpenseReportResponse,
} from "@/app/api/expense-reports/contract"
import styles from "./ExpenseReportDetailsModal.module.scss"

type ExpenseReportRow = GetExpenseReportsResponse["data"][number]
type EditableFieldKey = keyof UpdateExpenseReportRequest
type FormState = Record<EditableFieldKey, string>

type FieldConfig = {
    key: EditableFieldKey
    label: string
    inputType: "text" | "number" | "textarea"
}

type Props = {
    open: boolean
    report: ExpenseReportRow
    isSaving: boolean
    onOpenChange: (open: boolean) => void
    onSave: (id: string, changes: UpdateExpenseReportRequest) => Promise<UpdateExpenseReportResponse>
}

const fieldConfigs: FieldConfig[] = [
    { key: "invoiceNumber", label: "Invoice Number", inputType: "text" },
    { key: "description", label: "Description", inputType: "textarea" },
    { key: "amount", label: "Amount", inputType: "number" },
    { key: "currency", label: "Currency", inputType: "text" },
    { key: "category", label: "Category", inputType: "text" },
    { key: "expenseDate", label: "Expense Date", inputType: "text" },
    { key: "vendorName", label: "Vendor Name", inputType: "text" },
    { key: "additionalNotes", label: "Additional Notes", inputType: "textarea" },
    { key: "subtotal", label: "Subtotal", inputType: "number" },
    { key: "taxAmount", label: "Tax Amount", inputType: "number" },
    { key: "dueDate", label: "Due Date", inputType: "text" },
    { key: "vendorTaxId", label: "Vendor Tax ID", inputType: "text" },
]

const ExpenseReportDetailsModal = (props: Props) => {
    const report = props.report
    const [isEditing, setIsEditing] = useState(false)
    const [formState, setFormState] = useState<FormState>(() => getInitialFormState(report))

    return (
        <Modal open={props.open} onOpenChange={props.onOpenChange} scrollable>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>Expense Report</p>
                        <h2 className={styles.title}>{report.invoiceNumber ?? report.id}</h2>
                    </div>
                    <div className={styles.headerActions}>
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    className={styles.secondaryButton}
                                    onClick={() => {
                                        setIsEditing(false)
                                        setFormState(getInitialFormState(report))
                                    }}
                                    disabled={props.isSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className={styles.primaryButton}
                                    onClick={async () => {
                                        try {
                                            await props.onSave(report.id, getFormPayload(formState))
                                            setIsEditing(false)
                                            props.onOpenChange(false)
                                        } catch {
                                            return
                                        }
                                    }}
                                    disabled={props.isSaving}
                                >
                                    {props.isSaving ? "Saving..." : "Save"}
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={() => setIsEditing(true)}
                            >
                                Edit
                            </button>
                        )}
                    </div>
                </div>

                <div className={styles.meta}>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>ID</span>
                        <span className={styles.metaValue}>{report.id}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Status</span>
                        <span className={styles.metaValue}>{report.status}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Confidence</span>
                        <span className={styles.metaValue}>
                            {typeof report.confidence === "number" ? report.confidence.toFixed(2) : "-"}
                        </span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Receipt</span>
                        {report.receiptUrl ? (
                            <a
                                className={styles.link}
                                href={report.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View PDF
                            </a>
                        ) : (
                            <span className={styles.metaValue}>Unavailable</span>
                        )}
                    </div>
                </div>

                <div className={styles.fields}>
                    {fieldConfigs.map((field) => (
                        <label key={field.key} className={styles.field}>
                            <span className={styles.label}>{field.label}</span>
                            {isEditing ? (
                                field.inputType === "textarea" ? (
                                    <textarea
                                        className={styles.textarea}
                                        value={formState[field.key]}
                                        onChange={(event) => {
                                            setFormState((currentState) => ({
                                                ...currentState,
                                                [field.key]: event.target.value,
                                            }))
                                        }}
                                        rows={4}
                                    />
                                ) : (
                                    <input
                                        className={styles.input}
                                        type={field.inputType}
                                        value={formState[field.key]}
                                        onChange={(event) => {
                                            setFormState((currentState) => ({
                                                ...currentState,
                                                [field.key]: event.target.value,
                                            }))
                                        }}
                                    />
                                )
                            ) : (
                                <span className={styles.value}>
                                    {getDisplayValue(report[field.key])}
                                </span>
                            )}
                        </label>
                    ))}
                </div>
            </div>
        </Modal>
    )
}

export default ExpenseReportDetailsModal

const getInitialFormState = (report: ExpenseReportRow): FormState => ({
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

const getFormPayload = (
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

const getDisplayValue = (value: string | number | null) => {
    if (value === null) {
        return "-"
    }

    return value
}
