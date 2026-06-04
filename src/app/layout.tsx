import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ToastProvider } from "@/components/ui/Toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Savaari — Curated Road-Trip Packages",
  description: "Book curated outstation & local road-trip packages with handpicked stops, verified drivers and all-inclusive pricing.",
  keywords: "Savaari, road trip packages, outstation cabs, local sightseeing, car rental India, Bangalore Mysore packages",
  openGraph: {
    title: "Savaari — Curated Road-Trip Packages",
    description: "Handpicked stops, all-inclusive pricing, zero planning. One-way, round-trip & local packages.",
    siteName: "Savaari",
    images: [{ url: "/opengraph-image" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} font-sans antialiased`}>
        <ToastProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Analytics />
          <SpeedInsights />
        </ToastProvider>
      </body>
    </html>
  );
}
