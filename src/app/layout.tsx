import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PlayBeat 2 Admin — Digital Pvt Ltd",
  description:
    "PlayBeat Admin Panel — manage orders, products, customers, IPTV and analytics for your digital storefront.",
  keywords: [
    "PlayBeat",
    "Admin Panel",
    "Dashboard",
    "E-commerce",
    "IPTV",
    "Analytics",
  ],
  authors: [{ name: "PlayBeat Digital Pvt Ltd" }],
  icons: {
    icon: "/playbeat-logo.png",
  },
  openGraph: {
    title: "PlayBeat Admin",
    description: "Manage your digital storefront with PlayBeat Admin",
    siteName: "PlayBeat Digital",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlayBeat Admin",
    description: "Manage your digital storefront with PlayBeat Admin",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground font-sans`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
