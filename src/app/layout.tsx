import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "minokyo — Minik tarzlar, büyük mutluluklar",
  description:
    "Çocuklar için rahat, şık ve kaliteli kıyafetler. Sweatshirt takımları, triko kazaklar ve desenli pantolonlar.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "minokyo",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icon-512.png",
    apple: "/icon-512.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
