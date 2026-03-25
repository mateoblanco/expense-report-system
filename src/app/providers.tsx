"use client"

import { QueryProvider } from "@/providers/QueryProvider"
import { UserProvider } from "@/providers/UserProvider"

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider>
      <UserProvider>{children}</UserProvider>
    </QueryProvider>
  )
}
