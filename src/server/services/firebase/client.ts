import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"
import { serverEnv } from "@/utils/envHelper"

const ensureInitialized = () => {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: serverEnv.firebase.projectId,
        clientEmail: serverEnv.firebase.clientEmail,
        privateKey: serverEnv.firebase.privateKey,
      }),
      storageBucket: serverEnv.firebase.storageBucket,
    })
  }
}

export const getDb = () => {
  ensureInitialized()
  return getFirestore()
}

export const getStorageInstance = () => {
  ensureInitialized()
  return getStorage()
}
