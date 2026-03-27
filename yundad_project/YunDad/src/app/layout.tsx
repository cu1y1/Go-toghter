import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "孕爸爸",
  description: "专业的孕期陪伴App，为准爸爸提供全面的孕期知识、食谱推荐、打卡记录和待产清单管理。",
  keywords: ["孕期", "准爸爸", "怀孕", "食谱", "打卡", "待产包", "孕期管理"],
  authors: [{ name: "孕爸爸团队" }],
  icons: {
    icon: "/logo.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "孕爸爸",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "孕爸爸 - 专业孕期陪伴App",
    description: "为准爸爸提供全面的孕期知识、食谱推荐、打卡记录和待产清单管理",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "孕爸爸",
    description: "专业孕期陪伴App",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F97316" },
    { media: "(prefers-color-scheme: dark)", color: "#EA580C" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
