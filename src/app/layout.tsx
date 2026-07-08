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
  title: "Rishaad Baker's — Delicious Taste | Hand-crafted Cakes & Baking Classes",
  description:
    "Rishaad Baker's bakes hand-crafted layer cakes, cupcakes, pastries, and bespoke celebration cakes in Mombasa, Kenya. Order online or join our Beginner Baking Class — Learn. Bake. Earn!",
  keywords: [
    "bakery",
    "cakes",
    "custom cakes",
    "cupcakes",
    "pastries",
    "Mombasa bakery",
    "Rishaad Baker's",
    "wedding cakes",
    "birthday cakes",
    "baking class",
    "baking school",
    "beginner baking class",
  ],
  authors: [{ name: "Rishaad Baker's" }],
  icons: {
    icon: "/rishaad-logo.jpeg",
  },
  openGraph: {
    title: "Rishaad Baker's — Delicious Taste",
    description: "Hand-crafted layer cakes, cupcakes, pastries, and bespoke celebration cakes. Order online or join our Beginner Baking Class.",
    siteName: "Rishaad Baker's",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rishaad Baker's",
    description: "Delicious Taste — Hand-crafted cakes, baked with love. Learn. Bake. Earn!",
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
