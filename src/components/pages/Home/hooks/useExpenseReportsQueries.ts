import {
    ExpenseReportsSuccessResponse,
    expenseReportsSuccessResponseSchema,
    GetExpenseReportsResponse,
    UpdateExpenseReportRequest,
    UpdateExpenseReportResponse,
    updateExpenseReportResponseSchema,
} from "@/app/api/expense-reports/contract"
import { useUser } from "@/providers/UserProvider"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { useAddErrorToast } from "./useAddErrorToast"


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

const postExpenseReports = async (files: File[], getToken: () => Promise<string>) => {
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
        const errorResponse = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(errorResponse?.error ?? `Request failed with status ${response.status}.`)
    }

    return expenseReportsSuccessResponseSchema.parse(await response.json())
}

const putExpenseReport = async (
    id: string,
    data: UpdateExpenseReportRequest,
    getToken: () => Promise<string>,
) => {
    const token = await getToken()
    const response = await fetch(`/api/expense-reports/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const errorResponse = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(errorResponse?.error ?? `Request failed with status ${response.status}.`)
    }

    return updateExpenseReportResponseSchema.parse(await response.json())
}

const useExpenseReportsQueries = () => {
    const { user } = useUser()
    const queryClient = useQueryClient()
    const addErrorToast = useAddErrorToast()

    const handleError = useCallback((error: unknown) => {
        if (error instanceof Error) {
            addErrorToast(error.message)
        } else {
            addErrorToast("Oops! Something went wrong")
        }
    }, [addErrorToast])

    const reportsQuery = useQuery<GetExpenseReportsResponse>({
        queryKey: ["expense-reports"],
        queryFn: () => fetchExpenseReports(() => user!.getIdToken()),
        enabled: !!user,
        refetchInterval: (query) => {
            const hasProcessingReports = query.state.data?.data?.some((report) => report.status === "processing")
            return hasProcessingReports ? 3000 : false
        },
    })

    const uploadMutation = useMutation<ExpenseReportsSuccessResponse, Error, File[]>({
        mutationFn: (files) => postExpenseReports(files, () => user!.getIdToken()),
        mutationKey: ["uploadExpenseReports"],
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["expense-reports"] })
        },
        onError: handleError,
    })

    const uploadExpenseReports = async (files: File[]) => {
        return await uploadMutation.mutateAsync(files)
    }

    const updateMutation = useMutation<UpdateExpenseReportResponse, Error, { id: string, changes: UpdateExpenseReportRequest }>({
        mutationFn: ({ id, changes }) => putExpenseReport(id, changes, () => user!.getIdToken()),
        mutationKey: ["updateExpenseReport"],
        onSuccess: (updatedReport) => {
            queryClient.setQueryData<GetExpenseReportsResponse | undefined>(["expense-reports"], (currentData) => {
                if (!currentData) {
                    return currentData
                }

                return {
                    data: currentData.data.map((report) => report.id === updatedReport.id ? updatedReport : report),
                }
            })
        },
        onError: handleError,
    })

    const updateExpenseReport = async (id: string, changes: UpdateExpenseReportRequest) => {
        return await updateMutation.mutateAsync({ id, changes })
    }

    return {
        upload: {
            onUpload: uploadExpenseReports,
            isLoading: uploadMutation.isPending,
            isError: uploadMutation.isError,
            isSuccess: uploadMutation.isSuccess,
        },
        reports: {
            isLoading: reportsQuery.isFetching,
            isError: reportsQuery.isError,
            isSuccess: reportsQuery.isSuccess,
            data: reportsQuery.data?.data,
        },
        update: {
            onSave: updateExpenseReport,
            isLoading: updateMutation.isPending,
            isError: updateMutation.isError,
            isSuccess: updateMutation.isSuccess,
        },
    }
}

export default useExpenseReportsQueries
