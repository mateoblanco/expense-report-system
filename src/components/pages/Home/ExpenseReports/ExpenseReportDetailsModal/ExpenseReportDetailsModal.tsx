import { useState } from "react"
import dynamic from "next/dynamic"
import Modal from "@/components/base/Modal/Modal"
import type {
    ExpenseReport,
    UpdateExpenseReportRequest,
    UpdateExpenseReportResponse,
} from "@/app/api/expense-reports/contract"
import styles from "./ExpenseReportDetailsModal.module.scss"
import Button from "@/components/base/Button/Button"
import { amountFieldConfigs, detailFieldConfigs, extraFieldConfigs, FieldConfig } from "./common"
import Field from "./Field/Field"
import { FormState, getInitialFormState, getFormPayload } from "./updateHelpers"
import StatusBadge from "../ExpenseReportsTable/StatusBadge/StatusBadge"

const ReceiptPreview = dynamic(() => import("./ReceiptPreview/ReceiptPreview"), {
    loading: () => (
        <div className={styles.previewLoading}>
            Loading receipt preview...
        </div>
    ),
    ssr: false,
})

type Props = {
    open: boolean
    report: ExpenseReport
    isSaving: boolean
    onOpenChange: (open: boolean) => void
    onSave: (id: string, changes: UpdateExpenseReportRequest) => Promise<UpdateExpenseReportResponse>
}

const ExpenseReportDetailsModal = (props: Props) => {
    const report = props.report
    const [isEditing, setIsEditing] = useState(false)
    const [formState, setFormState] = useState<FormState>(() => getInitialFormState(report))
    const hasReceipt = Boolean(report.receiptUrl)

    console.log(report)

    const handleCancel = () => {
        setIsEditing(false)
        setFormState(getInitialFormState(report))
    }

    const handleSave = async () => {

        await props.onSave(report.id, getFormPayload(formState))
        setIsEditing(false)
        props.onOpenChange(false)

    }

    const renderHeader = () => {
        return (
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>
                        Expense Report
                    </h2>
                </div>
                <div className={styles.headerActions}>
                    {isEditing ? (
                        <>
                            <Button
                                label="Cancel"
                                variant="secondary"
                                onClick={handleCancel}
                                disabled={props.isSaving}
                            />
                            <Button
                                label="Save"
                                variant="primary"
                                onClick={handleSave}
                                disabled={props.isSaving}
                                isLoading={props.isSaving}
                            />
                        </>
                    ) : (
                        <Button
                            label="Edit"
                            variant="primary"
                            onClick={() => setIsEditing(true)}
                            disabled={props.isSaving}
                            isLoading={props.isSaving}
                        />
                    )}
                </div>
            </div>
        )
    }

    const renderField = (field: FieldConfig, mode: "edit" | "view") => {
        const currency = field.inputType === "number" ? report.currency : undefined

        return (
            <Field
                label={field.label}
                size={field.size}
                inputType={field.inputType}
                key={field.key}
                value={formState[field.key]}
                mode={mode}
                onChange={(value) => {
                    setFormState((currentState) => ({
                        ...currentState,
                        [field.key]: value,
                    }))
                }}
                currency={currency}
            />
        )
    }

    return (
        <Modal
            open={props.open}
            onOpenChange={props.onOpenChange}
            scrollable
            popupClassName={styles.modalPopup}
        >
            {renderHeader()}
            <div className={styles.container}>
                <div className={styles.contentGrid}>
                    <div className={styles.detailsColumn}>
                        <div className={styles.section}>
                            <div className={styles.section_fields}>
                                <h3 className={styles.section_title}>Extraction Details</h3>
                            </div>
                            <div className={styles.extraction_details}>
                                <div className={styles.extraction_field}>
                                    <label className={styles.extraction_label}>ID</label>
                                    <span className={styles.extraction_value}>{report.id}</span>
                                </div>
                                <div className={styles.extraction_field}>
                                    <label className={styles.extraction_label}>Status</label>
                                    <span className={styles.extraction_value}>
                                        <StatusBadge status={report.status} />
                                    </span>
                                </div>
                                <div className={styles.extraction_field}>
                                    <label className={styles.extraction_label}>Confidence</label>
                                    <span className={styles.extraction_value}>{typeof report.confidence === "number" ? `${(report.confidence * 100).toFixed(0)}%` : "-"}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.section_fields}>
                                <h3 className={styles.section_title}>Details</h3>
                                <div className={styles.fields}>
                                    {detailFieldConfigs.map((field) => (
                                        renderField(field, isEditing ? "edit" : "view")
                                    ))}
                                </div>
                                <div className={styles.fields}>
                                    {amountFieldConfigs.map((field) => (
                                        renderField(field, isEditing ? "edit" : "view")
                                    ))}
                                </div>
                                <div className={styles.fields}>
                                    {extraFieldConfigs.map((field) => (
                                        renderField(field, isEditing ? "edit" : "view")
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {hasReceipt && <aside className={styles.previewColumn}>

                        <ReceiptPreview
                            reportId={report.id}
                            url={report.receiptUrl!}
                            fileName={report.receiptFileName}
                        />

                    </aside>}
                </div>
            </div>
        </Modal>
    )
}

export default ExpenseReportDetailsModal
