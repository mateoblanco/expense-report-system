"use client"

import { useEffect, useEffectEvent, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { useUser } from "@/providers/UserProvider"
import styles from "./ReceiptPreview.module.scss"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
).toString()

const MIN_PAGE_WIDTH = 240
const VIEWPORT_PADDING = 32

type Props = {
    reportId: string
    url: string
    fileName: string | null
}

const getFileNameFromUrl = (url: string) => {
    try {
        const lastPathSegment = new URL(url).pathname.split("/").pop()
        return lastPathSegment ? decodeURIComponent(lastPathSegment).split("/").pop() ?? lastPathSegment : null
    } catch {
        return null
    }
}

const getReceiptKind = (fileName: string | null) => {
    const normalizedFileName = fileName?.toLowerCase() ?? ""

    if (normalizedFileName.endsWith(".pdf")) {
        return "pdf"
    }

    if (normalizedFileName.endsWith(".png") || normalizedFileName.endsWith(".jpg") || normalizedFileName.endsWith(".jpeg")) {
        return "image"
    }

    return "unknown"
}

const ReceiptPreview = (props: Props) => {
    const { user } = useUser()
    const userId = user?.uid ?? null
    const [pageNumber, setPageNumber] = useState(1)
    const [numPages, setNumPages] = useState<number | null>(null)
    const [pageWidth, setPageWidth] = useState(320)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [previewError, setPreviewError] = useState<string | null>(null)
    const [isLoadingPreview, setIsLoadingPreview] = useState(true)
    const [contentType, setContentType] = useState<string | null>(null)
    const viewportRef = useRef<HTMLDivElement | null>(null)

    const resolvedFileName = props.fileName ?? getFileNameFromUrl(props.url)
    const receiptKind = contentType?.includes("pdf")
        ? "pdf"
        : contentType?.startsWith("image/")
            ? "image"
            : getReceiptKind(resolvedFileName)

    const getToken = useEffectEvent(async () => {
        return user ? user.getIdToken() : null
    })

    useEffect(() => {
        let didCancel = false
        let objectUrl: string | null = null
        const controller = new AbortController()

        const loadPreview = async () => {
            if (!userId) {
                if (!didCancel) {
                    setPreviewError("You need to be signed in to load this file.")
                    setIsLoadingPreview(false)
                }
                return
            }

            try {
                setIsLoadingPreview(true)
                setPreviewError(null)
                setPreviewUrl(null)
                setContentType(null)
                setNumPages(null)
                setPageNumber(1)

                const token = await getToken()

                if (!token) {
                    throw new Error("You need to be signed in to load this file.")
                }

                const response = await fetch(`/api/expense-reports/${props.reportId}/receipt`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal: controller.signal,
                })

                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}.`)
                }

                const blob = await response.blob()
                objectUrl = URL.createObjectURL(blob)

                if (!didCancel) {
                    setPreviewUrl(objectUrl)
                    setContentType(response.headers.get("content-type"))
                }
            } catch (error) {
                if (controller.signal.aborted || didCancel) {
                    return
                }

                setPreviewError(error instanceof Error ? error.message : "Failed to load receipt preview.")
            } finally {
                if (!didCancel) {
                    setIsLoadingPreview(false)
                }
            }
        }

        void loadPreview()

        return () => {
            didCancel = true
            controller.abort()
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl)
            }
        }
    }, [props.reportId, userId])

    useEffect(() => {
        const viewportElement = viewportRef.current

        if (!viewportElement) {
            return
        }

        const updatePageWidth = (width: number) => {
            setPageWidth(Math.max(MIN_PAGE_WIDTH, Math.floor(width - VIEWPORT_PADDING)))
        }

        updatePageWidth(viewportElement.clientWidth)

        const observer = new ResizeObserver((entries) => {
            const nextWidth = entries[0]?.contentRect.width

            if (typeof nextWidth === "number") {
                updatePageWidth(nextWidth)
            }
        })

        observer.observe(viewportElement)

        return () => {
            observer.disconnect()
        }
    }, [])

    return (
        <div className={styles.preview}>
            {/* <div className={styles.header}>
               
                <a
                    className={styles.link}
                    href={props.url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Open file
                </a>
            </div> */}

            {isLoadingPreview ? (
                <div className={styles.unsupported}>
                    <p className={styles.feedback}>Loading receipt preview...</p>
                </div>
            ) : null}

            {previewError ? (
                <div className={styles.unsupported}>
                    <p className={styles.feedback}>{previewError}</p>
                </div>
            ) : null}

            {receiptKind === "pdf" ? (
                <>
                    <div className={styles.viewport} ref={viewportRef}>
                        <Document
                            file={previewUrl}
                            loading={<p className={styles.feedback}>Loading PDF...</p>}
                            error={<p className={styles.feedback}>Could not render this PDF.</p>}
                            onLoadSuccess={({ numPages: nextNumPages }: { numPages: number }) => {
                                setNumPages(nextNumPages)
                                setPageNumber((currentPage) => Math.min(currentPage, nextNumPages))
                            }}
                        >
                            <Page
                                className={styles.page}
                                pageNumber={pageNumber}
                                width={pageWidth}
                                renderAnnotationLayer={false}
                                renderTextLayer={false}
                                loading={<p className={styles.feedback}>Loading page...</p>}
                            />
                        </Document>
                    </div>

                    <div className={styles.controls}>
                        <button
                            className={styles.controlButton}
                            type="button"
                            onClick={() => setPageNumber((currentPage) => Math.max(1, currentPage - 1))}
                            disabled={pageNumber <= 1}
                        >
                            Previous
                        </button>
                        <span className={styles.pageCounter}>
                            {numPages ? `Page ${pageNumber} of ${numPages}` : "Preparing preview..."}
                        </span>
                        <button
                            className={styles.controlButton}
                            type="button"
                            onClick={() => {
                                if (!numPages) {
                                    return
                                }

                                setPageNumber((currentPage) => Math.min(numPages, currentPage + 1))
                            }}
                            disabled={!numPages || pageNumber >= numPages}
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : !isLoadingPreview && !previewError && previewUrl ? null : null}

            {receiptKind === "image" && previewUrl ? (
                <div className={styles.viewport}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        className={styles.image}
                        src={previewUrl}
                        alt={resolvedFileName ?? "Receipt preview"}
                        loading="lazy"
                    />
                </div>
            ) : null}
        </div>
    )
}

export default ReceiptPreview
