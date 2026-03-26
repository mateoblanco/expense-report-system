import { useState } from "react"
import useExpenseReportsMutations from "../../hooks/useExpenseReportsQueries"
import Modal from "@/components/base/Modal/Modal"
import styles from "./CreateReportsModal.module.scss"
import Button from "@/components/base/Button/Button"
import FileDropzone from "./FileDropzone"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const CreateReportsModal = (props: Props) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])

    const { upload } = useExpenseReportsMutations()

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setSelectedFiles([])
        }

        props.onOpenChange(open)
    }

    const handleUpload = async () => {
        try {
            await upload.onUpload(selectedFiles)
            handleOpenChange(false)
        } catch {
            handleOpenChange(false)

        }
    }

    return (
        <Modal open={props.open} onOpenChange={handleOpenChange}>
            <div className={styles.container}>
                <p className={styles.title}>
                    Upload PDF, JPG, or PNG receipts to create expense reports.
                </p>

                <FileDropzone
                    files={selectedFiles}
                    disabled={upload.isLoading}
                    onFilesChange={setSelectedFiles}
                />

                <div className={styles.actions}>
                    <Button
                        label={"Upload"}
                        variant="primary"
                        fullWidth
                        disabled={upload.isLoading || selectedFiles.length === 0}
                        isLoading={upload.isLoading}
                        onClick={handleUpload}
                    />
                </div>
            </div>
        </Modal>
    )
}

export default CreateReportsModal
