import "./globals.css"

import { Noto_Sans_JP } from "next/font/google"

import layoutStyles from "@/shared/components/layout/AppLayout.module.css"
import Sidebar from "@/shared/components/layout/Sidebar"
import QuickLookupLayer from "@/features/dictionary/quick-lookup/components/QuickLookupLayer"

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
  preload: true,
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" translate="no" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={notoSansJP.className}
        translate="no"
        suppressHydrationWarning
      >
        <div className={layoutStyles.appLayout}>
          <Sidebar />
          <div className={layoutStyles.appMain}>
            {children}
          </div>
        </div>
        <div id="portal-root" />
        <QuickLookupLayer />
      </body>
    </html>
  )
}
