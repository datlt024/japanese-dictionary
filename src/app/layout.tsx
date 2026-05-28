import "./globals.css"

import { Noto_Sans_JP } from "next/font/google"
import BottomNavigation from "@/components/layout/BottomNavigation"

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={notoSansJP.className}>
        {children}
        <BottomNavigation />
      </body>
    </html>
  )
}