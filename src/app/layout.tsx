import type { Metadata } from "next"
import "./globals.css"

import { Noto_Sans_JP, Space_Grotesk } from "next/font/google"

import layoutStyles from "@/shared/components/layout/AppLayout.module.css"
import Sidebar from "@/shared/components/layout/Sidebar"
import QuickLookupLayer from "@/features/dictionary/quick-lookup/components/QuickLookupLayer"

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
  preload: true,
  variable: "--loaded-font-body",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
  preload: true,
  variable: "--loaded-font-display",
})

export const metadata: Metadata = {
  title: {
    default: "Yomi — Từ điển Nhật Việt",
    template: "%s | Yomi",
  },
  description:
    "Tra cứu từ vựng, Hán tự và ngữ pháp tiếng Nhật dành cho người học Việt Nam. Đầy đủ ví dụ, phiên âm và giải thích bằng tiếng Việt.",
  keywords: ["từ điển nhật việt", "học tiếng nhật", "jlpt", "hán tự", "ngữ pháp nhật"],
  authors: [{ name: "Yomi" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://yomi.vn"),
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Yomi",
    title: "Yomi — Từ điển Nhật Việt",
    description:
      "Tra cứu từ vựng, Hán tự và ngữ pháp tiếng Nhật dành cho người học Việt Nam.",
  },
  twitter: {
    card: "summary",
    title: "Yomi — Từ điển Nhật Việt",
    description:
      "Tra cứu từ vựng, Hán tự và ngữ pháp tiếng Nhật dành cho người học Việt Nam.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" translate="no" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${notoSansJP.variable} ${spaceGrotesk.variable}`}
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
