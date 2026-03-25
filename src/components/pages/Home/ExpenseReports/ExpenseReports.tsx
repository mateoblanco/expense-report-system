import { useState } from "react"
import classNames from "classnames"
import type { GetExpenseReportsResponse } from "@/app/api/expense-reports/contract"
import Table, { type TableColumn } from "@/components/base/Table/Table"
import { formatAmountWithCurrency } from "@/utils/currency"
import useExpenseReportsMutations from "../hooks/useExpenseReportsQueries"
import styles from "./ExpenseReports.module.scss"
import CreateReportsModal from "./CreateReportsModal/CreateReportsModal"
import ExpenseReportDetailsModal from "./ExpenseReportDetailsModal/ExpenseReportDetailsModal"

type ExpenseReportRow = GetExpenseReportsResponse["data"][number]

const ExpenseReports = () => {
    const { reports, update } = useExpenseReportsMutations()
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

    const selectedReport = reports.data?.find((report) => report.id === selectedReportId) ?? null

    const reportColumns: TableColumn<ExpenseReportRow>[] = [
        { key: "invoiceNumber", header: "Invoice Number" },
        { key: "category", header: "Category" },
        { key: "vendorName", header: "Vendor Name" },
        { key: "expenseDate", header: "Expense Date" },
        { key: "dueDate", header: "Due Date" },
        {
            key: "amount",
            header: "Amount",
            render: (value, row) => typeof value === "number" ? formatAmountWithCurrency(value, row.currency) : null,
        },
        {
            key: "status",
            header: "Status",
            render: (value, row) => {
                return (
                    <div className={styles.statusCell}>
                        <span className={classNames(styles.statusBadge, {
                            [styles.processing]: value === "processing",
                            [styles.completed]: value === "completed",
                            [styles.failed]: value === "failed",
                        })}>
                            {getStatusLabel(value as ExpenseReportRow["status"])}
                        </span>
                        <span className={styles.confidenceText}>
                            {typeof row.confidence === "number" ? `${(row.confidence * 100).toFixed(0)}%` : "-"}
                        </span>
                    </div>
                )
            },
        },
        {
            key: "receiptUrl",
            header: "",
            render: (value) => (
                value ? (
                    <a
                        className={styles.receiptLink}
                        href={value as string}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View
                    </a>
                ) : (
                    <span className={styles.mutedText}>Unavailable</span>
                )
            )
        },
        {
            header: "",
            render: (_value, row) => (
                <button
                    type="button"
                    className={styles.inlineButton}
                    onClick={() => {
                        setSelectedReportId(row.id)
                        setIsDetailsModalOpen(true)
                    }}
                >
                    View / Edit
                </button>
            ),
        },
    ]

    return (
        <>
            <main className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Expense Reports</h1>
                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            Create Report
                        </button>
                    </div>
                </div>
                <div className={styles.reports_container}>
                    <div aria-live="polite">
                        {reports.isLoading ? <p className={styles.feedback}>Loading reports...</p> : null}
                        {reports.isError ? <p className={styles.feedback}>Could not load reports.</p> : null}
                        {!reports.isLoading && !reports.isError ? (
                            <Table
                                columns={reportColumns}
                                data={reports.data ?? []}
                            />
                        ) : null}
                    </div>
                </div>
            </main>

            <CreateReportsModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
            {selectedReport ? (
                <ExpenseReportDetailsModal
                    key={selectedReport.id}
                    open={isDetailsModalOpen}
                    report={selectedReport}
                    isSaving={update.isLoading}
                    onOpenChange={(open) => {
                        setIsDetailsModalOpen(open)

                        if (!open) {
                            setSelectedReportId(null)
                        }
                    }}
                    onSave={update.onSave}
                />
            ) : null}
        </>
    )
}

export default ExpenseReports

const getStatusLabel = (status: ExpenseReportRow["status"]) => {
    if (status === "processing") {
        return "Processing"
    }

    if (status === "completed") {
        return "Completed"
    }

    if (status === "failed") {
        return "Failed"
    }

    return status
}
