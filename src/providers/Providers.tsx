"use client"

import { QueryProvider } from "@/providers/QueryProvider"
import { UserProvider } from "@/providers/UserProvider"
import { Toast } from '@base-ui/react/toast'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const toastManager = Toast.createToastManager();

  return (
    <QueryProvider>
      <UserProvider>
        <Toast.Provider toastManager={toastManager}>
          {children}
        </Toast.Provider>
      </UserProvider>
    </QueryProvider>
  )
}
