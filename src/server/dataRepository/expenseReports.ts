import { getDb } from "@/server/services/firebase/client"
import type { ExpenseReport, CreateExpenseReportData } from "@/types"

const expenseReportsCollection = () => getDb().collection("ExpenseReport")

const findExpenseReportById = async (id: string): Promise<ExpenseReport | null> => {
  const doc = await expenseReportsCollection().doc(id).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() } as ExpenseReport
}

const findExpenseReportsByUserId = async (userId: string): Promise<ExpenseReport[]> => {
  const snapshot = await expenseReportsCollection().where("userId", "==", userId).get()
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as ExpenseReport)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

const createExpenseReport = async (data: CreateExpenseReportData): Promise<ExpenseReport> => {
  const ref = expenseReportsCollection().doc()
  const now = new Date().toISOString()
  const report: Omit<ExpenseReport, "id"> = { ...data, createdAt: now, updatedAt: now }
  await ref.set(report)
  return { id: ref.id, ...report }
}

const updateExpenseReport = async (
  id: string,
  data: Partial<Omit<ExpenseReport, "id" | "createdAt">>,
): Promise<ExpenseReport | null> => {
  const ref = expenseReportsCollection().doc(id)
  await ref.update({ ...data, updatedAt: new Date().toISOString() })
  const updated = await ref.get()
  if (!updated.exists) return null
  return { id: updated.id, ...updated.data() } as ExpenseReport
}

const deleteExpenseReport = async (id: string): Promise<void> => {
  await expenseReportsCollection().doc(id).delete()
}


export const ExpenseReportsRepository = {
  findExpenseReportById,
  findExpenseReportsByUserId,
  createExpenseReport,
  updateExpenseReport,
  deleteExpenseReport,
}
