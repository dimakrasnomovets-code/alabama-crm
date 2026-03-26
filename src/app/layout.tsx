import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ToastProvider from "@/components/providers/toast-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Alabama Foreclosure CRM",
  description: "Foreclosure lead pipeline management for Alabama properties",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
