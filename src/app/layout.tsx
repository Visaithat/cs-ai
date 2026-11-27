import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/noto-sans-thai/wght.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { GlossaryProvider } from "@/components/Glossary";
import { SiteHeader } from "@/components/SiteHeader";
import { LESSON_IDS } from "@/content";
import { assetPath } from "@/lib/assetPath";

export const metadata: Metadata = {
  title: { default: "Neural Path — AI Engineer 180 วัน", template: "%s · Neural Path" },
  description:
    "ตำราดิจิทัลสองภาษา (ไทย/อังกฤษ) สำหรับหลักสูตร AI Engineer 180 วัน วันละ 30 นาที — เปิดอ่านวันไหนก็ได้ใน 180 วัน เริ่มที่ Day 1: uv และ Pydantic v2",
  icons: { icon: assetPath("/assets/neural-path-mark.svg") },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1020" },
  ],
};

/** Runs before first paint so the saved/system theme never flashes the wrong palette. */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('neural-path:theme');var d=t==='dark'||((t!=='light')&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.dataset.theme=d?'dark':'light';r.style.colorScheme=d?'dark':'light'}catch(e){}})()`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only-focusable fixed left-3 top-3 z-50 rounded-xl bg-brand-solid px-4 py-3 font-semibold text-white"
        >
          ข้ามไปยังเนื้อหาหลัก
        </a>
        <AuthProvider>
          <GlossaryProvider>
            <SiteHeader />
            <main id="main" tabIndex={-1} className="mx-auto max-w-[1400px] px-4 pb-24 pt-8 outline-none sm:px-6 lg:pb-20">
              {children}
            </main>
            <footer className="border-t border-hair">
              <div className="mx-auto max-w-[1400px] px-4 py-6 text-[0.8125rem] text-muted sm:px-6">
                <p>
                  Neural Path · ตำราดิจิทัล AI Engineer 180 วัน ({LESSON_IDS.length} บทเรียนเต็มครบทั้งหลักสูตร) · ซิงก์ความคืบหน้าและไฟล์เสียงผ่าน Supabase (หรือใช้งานแบบ Guest ในเบราว์เซอร์ได้ทันที)
                </p>
              </div>
            </footer>
          </GlossaryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
