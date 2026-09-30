import type { Metadata, Viewport } from "next";
import { Poppins, Baloo_2 } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
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
  themeColor: "#5c4230",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${poppins.variable} ${baloo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
