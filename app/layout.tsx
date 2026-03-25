import type { Metadata } from "next";
import "./globals.css";

const metadataBaseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  process.env.SITE_URL?.trim() ||
  "https://ligs.io"
).replace(/\/+$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  title: "LIGS / IOC",
  description:
    "Enter your birthdate. Generate. Copy. Paste this into your AI chat. Then continue normally.",
  alternates: { canonical: "/ioc" },
  openGraph: {
    title: "LIGS / IOC",
    description:
      "Enter your birthdate. Generate. Copy. Paste this into your AI chat. Then continue normally.",
    siteName: "IOC",
    url: "/ioc",
  },
  twitter: {
    card: "summary",
    title: "LIGS / IOC",
    description:
      "Enter your birthdate. Generate. Copy. Paste this into your AI chat. Then continue normally.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
