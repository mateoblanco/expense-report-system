import { useEffect, useState } from "react"
import classNames from "classnames"
import type { GetExpenseReportsResponse } from "@/app/api/expense-reports/contract"
import Table, { type TableColumn } from "@/components/base/Table/Table"
import { formatAmountWithCurrency } from "@/utils/currency"
import useExpenseReportsMutations from "../hooks/useExpenseReportsQueries"
import styles from "./ExpenseReports.module.scss"
import CreateReportsModal from "./CreateReportsModal/CreateReportsModal"

type ExpenseReportRow = GetExpenseReportsResponse["data"][number]

const reportColumns: TableColumn<ExpenseReportRow>[] = [
    { key: "invoiceNumber", header: "Invoice Number" },

    { key: "category", header: "Category" },
    { key: "vendorName", header: "Vendor Name" },
    { key: "expenseDate", header: "Expense Date" },
    { key: "dueDate", header: "Due Date" },
    {
        key: "amount",
        header: "Amount",
        render: (value, row) => value ? formatAmountWithCurrency(value as number, row.currency as string) : null,
    },

    {
        key: "status",
        header: "Status",
        render: (value, row) => {
            return (
                <>
                    <span className={classNames(styles.statusBadge, {
                        [styles.processing]: value === "processing",
                        [styles.completed]: value === "completed",
                        [styles.failed]: value === "failed",
                    })}>
                        {getStatusLabel(value as "processing" | "completed" | "failed")}
                    </span>
                    {
                        row.confidence && `${(row.confidence * 100)}%`
                    }
                </>
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
        ),
    },
    {
        header: "",
        render: () => (
           <button type="button" onClick={() => console.log("edit")}>Edit</button>
        ),
    },
]

const ExpenseReports = () => {

    const { reports } = useExpenseReportsMutations()
    const { onFetch } = reports
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        void onFetch()
    }, [onFetch])

    return (
        <>
            <main className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Expense Reports</h1>
                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
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

            <CreateReportsModal open={isModalOpen} onOpenChange={setIsModalOpen} />
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
