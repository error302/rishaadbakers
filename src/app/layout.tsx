import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Rishaad Bakers — Hand-crafted Cakes & Pastries",
  description:
    "Rishaad Bakers bakes hand-crafted layer cakes, cupcakes, pastries, and bespoke celebration cakes in Portland. Order online for pickup or delivery.",
  keywords: [
    "bakery",
    "cakes",
    "custom cakes",
    "cupcakes",
    "pastries",
    "Portland bakery",
    "Rishaad Bakers",
    "wedding cakes",
    "birthday cakes",
  ],
  authors: [{ name: "Rishaad Bakers" }],
  openGraph: {
    title: "Rishaad Bakers — Hand-crafted Cakes & Pastries",
    description: "Hand-crafted layer cakes, cupcakes, pastries, and bespoke celebration cakes. Order online for pickup or delivery.",
    siteName: "Rishaad Bakers",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rishaad Bakers",
    description: "Hand-crafted cakes, baked with love since 2014.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
          <SonnerToaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
