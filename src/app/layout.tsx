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
  title: "Savaari — Road Trips, Reimagined | Powered by Sarathi AI",
  description: "Experience the future of road trips with Savaari, powered by Sarathi AI. Smart route planning, curated stops, and seamless outstation car rentals.",
  keywords: "Savaari, Sarathi AI, AI trip planner, road trip planner, outstation cabs, car rental India",
  openGraph: {
    title: "Savaari — Road Trips, Reimagined | Powered by Sarathi AI",
    description: "Plan your perfect road trip with Savaari. Smart routes, hidden gems, and seamless bookings — powered by Sarathi AI.",
    siteName: "Savaari",
    images: [{
      url: "/opengraph-image",
    }],
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
