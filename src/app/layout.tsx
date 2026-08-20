import type { Metadata } from "next"
import "./globals.css"

import { Noto_Sans_JP, Space_Grotesk } from "next/font/google"

import layoutStyles from "@/shared/components/layout/AppLayout.module.css"
import Sidebar from "@/shared/components/layout/Sidebar"
import QuickLookupLayer from "@/features/dictionary/quick-lookup/components/QuickLookupLayer"
import { createSupabaseServerClient } from "@/server/supabase/auth-server"
import { isAdminUserId } from "@/server/utils/admin"

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
    card: "summary_large_image",
    title: "Yomi — Từ điển Nhật Việt",
    description:
      "Tra cứu từ vựng, Hán tự và ngữ pháp tiếng Nhật dành cho người học Việt Nam.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // getSession() reads the JWT from the cookie without a network round-trip.
  // Full getUser() verification happens inside each admin API route, so this
  // local decode is sufficient for showing/hiding the sidebar admin link.
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const isAdmin = session?.user ? isAdminUserId(session.user.id) : false

  return (
    <html lang="vi" translate="no" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${notoSansJP.variable} ${spaceGrotesk.variable}`}
        translate="no"
        suppressHydrationWarning
      >
        {/* Must be the very first child of <body> — runs before first paint,
            so data-theme is set before the browser renders anything visible. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement,dark=localStorage.getItem('yomi_setting_dark_mode')==='true',fur=localStorage.getItem('yomi_setting_furigana'),rom=localStorage.getItem('yomi_setting_romaji')==='true';d.setAttribute('data-theme',dark?'dark':'light');if(fur==='false')d.setAttribute('data-furigana','false');if(rom)d.setAttribute('data-romaji','true');}catch(e){}})();`,
          }}
        />
        <div className={layoutStyles.appLayout}>
          <Sidebar isAdmin={isAdmin} />
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
