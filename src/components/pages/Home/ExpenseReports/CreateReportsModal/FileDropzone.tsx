import { useCallback } from "react"
import classNames from "classnames"
import { useDropzone } from "react-dropzone"
import styles from "./FileDropzone.module.scss"

type Props = {
    files: File[]
    disabled?: boolean
    onFilesChange: (files: File[]) => void
}

const acceptedFileTypes = {
    "application/pdf": [".pdf"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
}

const FileDropzone = ({ files, disabled = false, onFilesChange }: Props) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        onFilesChange(acceptedFiles)
    }, [onFilesChange])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        disabled,
        multiple: true,
        accept: acceptedFileTypes,
    })

    return (
        <div
            {...getRootProps({
                className: classNames(styles.dropzone, {
                    [styles.dragActive]: isDragActive,
                    [styles.disabled]: disabled,
                }),
            })}
        >
            <input {...getInputProps()} />
            <p className={styles.title}>
            Drag and drop receipts here, or click to select files.
            </p>
            <p className={styles.description}>
                PDF, JPG, and PNG only.
            </p>
            <p className={styles.files}>
                {files.length > 0
                    ? `Selected ${files.length} file(s): ${files.map((file) => file.name).join(", ")}`
                    : "No files selected."}
            </p>
        </div>
    )
}

export default FileDropzone
