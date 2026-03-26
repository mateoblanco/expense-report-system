import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "@/styles/reset.scss";
import "@/styles/global.scss";
import { Providers } from "@/providers/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})


export const metadata: Metadata = {
  title: "Expense Report System",
  description: "Expense Report System",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} root` }>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
