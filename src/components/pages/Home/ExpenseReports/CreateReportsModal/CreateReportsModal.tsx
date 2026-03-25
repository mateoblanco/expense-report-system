import { useState } from "react"
import useExpenseReportsMutations from "../../hooks/useExpenseReportsQueries"
import Modal from "@/components/base/Modal/Modal"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const CreateReportsModal = (props: Props) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])

    const { upload } = useExpenseReportsMutations()

    return (
        <Modal open={props.open} onOpenChange={props.onOpenChange}>

            <p>
                Upload PDF, JPG, or PNG receipts to create expense reports.
            </p>

            <input
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                multiple
                onChange={(event) => {
                    setSelectedFiles(event.target.files ? Array.from(event.target.files) : [])
                }}
            />

            <p>
                {selectedFiles.length > 0
                    ? `Selected ${selectedFiles.length} file(s): ${selectedFiles.map((f) => f.name).join(", ")}`
                    : "No files selected."}
            </p>

            <button
                type="button"
                onClick={() => {
                    if (selectedFiles.length === 0) {
                        return
                    }

                    upload.onUpload(selectedFiles)
                }}
                disabled={upload.isLoading || selectedFiles.length === 0}
            >
                {upload.isLoading ? "Uploading..." : "Upload"}
            </button>
        </Modal>
    )
}

export default CreateReportsModal