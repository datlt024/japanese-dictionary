import "./globals.css"

import { Noto_Sans_JP } from "next/font/google"

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" translate="no">
      <body
        className={notoSansJP.className}
        translate="no"
      >
        {children}
      </body>
    </html>
  )
}