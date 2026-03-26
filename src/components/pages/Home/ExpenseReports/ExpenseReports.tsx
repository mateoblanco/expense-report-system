import { useState } from "react"
import useExpenseReportsMutations from "../hooks/useExpenseReportsQueries"
import styles from "./ExpenseReports.module.scss"
import CreateReportsModal from "./CreateReportsModal/CreateReportsModal"
import ExpenseReportDetailsModal from "./ExpenseReportDetailsModal/ExpenseReportDetailsModal"
import Button from "@/components/base/Button/Button"
import ExpenseReportsTable from "./ExpenseReportsTable/ExpenseReportsTable"
import AddIcon from '@/assets/icons/add.svg';

const ExpenseReports = () => {
    const { reports, update } = useExpenseReportsMutations()
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

    const selectedReport = reports.data?.find((report) => report.id === selectedReportId) ?? null

    const handleSelectReport = (reportId: string) => {
        setSelectedReportId(reportId)
        setIsDetailsModalOpen(true)
    }

    return (
        <>
            <main className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.items_count}>Total reports: {reports.data?.length ?? 0}</h1>
                    <div className={styles.actions}>
                        <Button
                            label="Create Report"
                            variant="primary"
                            onClick={() => setIsCreateModalOpen(true)}
                            icon={<AddIcon width={12} height={12} />}
                        />
                    </div>
                </div>
                <div className={styles.reports_container}>
                    <ExpenseReportsTable
                        onSelectReport={handleSelectReport}
                        isLoading={reports.isLoading}
                        isError={reports.isError}
                        data={reports.data ?? []}
                    />
                    <Button label="Refresh reports" variant="secondary" onClick={() => reports.refetch()} isLoading={reports.isRefreshing} />
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
