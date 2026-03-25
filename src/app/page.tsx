
"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import { auth } from "@/auth/firebase"
import { useUser } from "@/providers/UserProvider"

import {
  expenseReportsErrorResponseSchema,
  expenseReportsSuccessResponseSchema,
  type ExpenseReportsSuccessResponse,
  type GetExpenseReportsResponse,
} from "@/app/api/expense-reports/contract"

const Home = () => {
  const { user, loading } = useUser()

  if (loading) {
    return <main><p>Loading...</p></main>
  }

  if (!user) {
    return <LoginForm />
  }

  return <ExpenseReportDashboard />
}

export default Home

const googleProvider = new GoogleAuthProvider()

const LoginForm = () => {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleGoogleSignIn = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <h1>Expense Reports</h1>
      <button type="button" onClick={handleGoogleSignIn} disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in with Google"}
      </button>
      {error ? <p>{error}</p> : null}
    </main>
  )
}

const ExpenseReportDashboard = () => {
  const { user } = useUser()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const uploadMutation = useMutation<ExpenseReportsSuccessResponse, Error, File[]>({
    mutationFn: (files) => uploadExpenseReports(files, () => user!.getIdToken()),
  })

  const reportsQuery = useQuery<GetExpenseReportsResponse>({
    queryKey: ["expense-reports"],
    queryFn: () => fetchExpenseReports(() => user!.getIdToken()),
    enabled: false,
  })

  return (
    <main>
      <h1>Expense Reports</h1>
      <p>
        Logged in as {user!.email}
        {" "}
        <button type="button" onClick={() => signOut(auth)}>
          Logout
        </button>
      </p>
      <p>
        Upload PDF, JPG, or PNG receipts to create expense reports.
      </p>

      <input
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        multiple
        onChange={(event) => {
          setSelectedFiles(event.target.files ? Array.from(event.target.files) : [])
          uploadMutation.reset()
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

          uploadMutation.mutate(selectedFiles)
        }}
        disabled={uploadMutation.isPending || selectedFiles.length === 0}
      >
        {uploadMutation.isPending ? "Uploading..." : "Upload"}
      </button>

      <div aria-live="polite">
        {uploadMutation.isSuccess ? (
          <ul>
            {uploadMutation.data.createdIds.map((createdId) => (
              <li key={createdId}>
                {createdId}
              </li>
            ))}
          </ul>
        ) : null}

        {uploadMutation.isError ? (
          <p>Error: {uploadMutation.error.message}</p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => reportsQuery.refetch()}
        disabled={reportsQuery.isFetching}
      >
        {reportsQuery.isFetching ? "Loading..." : "Get Reports"}
      </button>

      <div aria-live="polite">
        {reportsQuery.isSuccess ? (
          <ul>
            {reportsQuery.data.data.map((report) => (
              <li key={report.id}>
                {report.id} — {report.status}{" "}
                {report.receiptUrl ? (
                  <a href={report.receiptUrl} target="_blank" rel="noopener noreferrer">
                    Ver
                  </a>
                ) : (
                  <span>Sin archivo disponible</span>
                )}
              </li>
            ))}
          </ul>
        ) : null}

        {reportsQuery.isError ? (
          <p>Error: {reportsQuery.error.message}</p>
        ) : null}
      </div>
    </main>
  )
}

const fetchExpenseReports = async (getToken: () => Promise<string>): Promise<GetExpenseReportsResponse> => {
  const token = await getToken()
  const response = await fetch("/api/expense-reports", {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`)
  }

  return response.json()
}

const uploadExpenseReports = async (files: File[], getToken: () => Promise<string>) => {
  const token = await getToken()
  const formData = new FormData()
  for (const file of files) {
    formData.append("files", file)
  }

  const response = await fetch("/api/expense-reports", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return expenseReportsSuccessResponseSchema.parse(await response.json())
}

const getErrorMessage = async (response: Response) => {
  const contentType = response.headers.get("content-type")

  if (contentType?.includes("application/json")) {
    const parsedResult = expenseReportsErrorResponseSchema.safeParse(
      await response.json(),
    )

    if (parsedResult.success) {
      return parsedResult.data.error
    }
  }

  const text = await response.text()

  if (text) {
    return text
  }

  return `Request failed with status ${response.status}.`
}
