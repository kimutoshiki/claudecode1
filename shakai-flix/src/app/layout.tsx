import type { Metadata } from "next";
import { BIZ_UDPGothic, Geist_Mono } from "next/font/google";
import { FontSizeBoot } from "@/components/layout/FontSizeBoot";
import { TopNav } from "@/components/layout/TopNav";
import { withBasePath } from "@/lib/utils";
import "./globals.css";

const bizUDPGothic = BIZ_UDPGothic({
  variable: "--font-jp",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shakai Flix — NHK for School 中学社会",
  description:
    "NHK for School の中学社会動画を Netflix 風 UI で視聴しつつ、ノート・クイズ・視聴履歴を一括管理する学習アプリ。",
  manifest: withBasePath("/manifest.webmanifest"),
  applicationName: "Shakai Flix",
  appleWebApp: {
    capable: true,
    title: "Shakai Flix",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: withBasePath("/icons/icon-192.svg"),
    apple: withBasePath("/icons/icon-192.svg"),
  },
};

export const viewport = {
  themeColor: "#e50914",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${bizUDPGothic.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <FontSizeBoot />
        <TopNav />
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
