import { ExpenseReport, GetExpenseReportsResponse } from "@/app/api/expense-reports/contract"
import Table, { type TableColumn } from "@/components/base/Table/Table"
import { formatAmountWithCurrency } from "@/utils/currency"
import styles from "./ExpenseReportsTable.module.scss"
import Button from "@/components/base/Button/Button"
import StatusBadge from "./StatusBadge/StatusBadge"
import FileIcon from '@/assets/icons/file.svg';

type Props = {
    onSelectReport: (reportId: string) => void,
    isLoading: boolean,
    isError: boolean,
    data: GetExpenseReportsResponse["data"]
}

const ExpenseReportsTable = (props: Props) => {
    const hasReports = props.data.length > 0

    const reportColumns: TableColumn<ExpenseReport>[] = [
        { key: "invoiceNumber", header: "Invoice Number", width: 10 },
        { key: "category", header: "Category", width: 10 },
        { key: "vendorName", header: "Vendor Name", width: 10 },
        { key: "expenseDate", header: "Expense Date", width: 10 },
        { key: "dueDate", header: "Due Date", width: 10 },
        {
            key: "amount",
            header: "Amount",
            width: 10,
            render: (value, row) => typeof value === "number" ? formatAmountWithCurrency(value, row.currency) : null,
        },
        {
            key: "status",
            header: "Status",
            width: 11,
            render: (value) => {
                return (
                    <div className={styles.statusCell}>
                        <StatusBadge status={value as ExpenseReport["status"]} />
                    </div>
                )
            },
        },
        {
            key: "receiptUrl",
            header: "",
            width: 4,
            render: (value) => (
                value && (
                    <a
                        className={styles.file}
                        href={value as string}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FileIcon width={16} height={16} />
                    </a>
                )
            )
        },
        {
            header: "",
            width: 10,
            render: (_value, row) => (
                <Button
                    label="View"
                    variant="secondary"
                    disabled={row.status === "processing"}
                    onClick={() => props.onSelectReport(row.id)}
                />
            ),
        },
    ]

    return (
        <div className={styles.container}>
            {props.isLoading && !hasReports ? <p className={styles.feedback}>Loading reports...</p> : null}
            {props.isError && !hasReports ? <p className={styles.feedback}>Could not load reports.</p> : null}
            {((!props.isLoading && !props.isError) || hasReports) ? (
                <Table
                    columns={reportColumns}
                    data={props.data ?? []}
                    isLoading={props.isLoading && !hasReports}
                    minWidth="960px"
                />
            ) : null}
        </div>
    )
}

export default ExpenseReportsTable
