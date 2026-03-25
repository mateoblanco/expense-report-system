import type { Metadata } from "next" 
import { Geist} from "next/font/google" 

import { Providers } from "./providers" 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
}) 


export const metadata: Metadata = {
  title: "Expense report System",
  description: "Expense report System",
} 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode 
}>) {
  return (
    <html lang="en" className={`${geistSans.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  ) 
}
