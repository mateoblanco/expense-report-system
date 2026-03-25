import { getStorageInstance } from "@/server/services/firebase/client"

export const uploadFile = async (
  path: string,
  buffer: Buffer,
  contentType: string,
) => {
  const file = getStorageInstance().bucket().file(path)
  await file.save(buffer, { contentType })
}

export const downloadFile = async (path: string): Promise<Buffer> => {
  const file = getStorageInstance().bucket().file(path)
  const [contents] = await file.download()
  return contents
}

export const deleteFile = async (path: string) => {
  const file = getStorageInstance().bucket().file(path)
  await file.delete()
}

export const getSignedUrl = async (path: string, expiresInMs = 15 * 60 * 1000): Promise<string> => {
  const file = getStorageInstance().bucket().file(path)
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + expiresInMs,
  })
  return url
}

const sanitizeFileName = (fileName: string) => {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-")
}

export const getInvoicesStoragePath = (reportId: string, fileName: string) => {
  return `invoices/${reportId}-${sanitizeFileName(fileName)}`
}