import { getAuth } from "firebase-admin/auth"
import { getDb } from "@/server/services/firebase/client"

export const verifyAuthToken = async (request: Request) => {
  // Ensure Firebase Admin is initialized by calling getDb
  getDb()

  const authorization = request.headers.get("Authorization")

  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header")
  }

  const token = authorization.slice(7)
  return getAuth().verifyIdToken(token)
}
