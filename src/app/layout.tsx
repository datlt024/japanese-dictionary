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
    <html lang="vi" translate="no" suppressHydrationWarning>
      <body
        className={notoSansJP.className}
        translate="no"
        suppressHydrationWarning
      >
        {children}
        <div id="portal-root" />
      </body>
    </html>
  )
}