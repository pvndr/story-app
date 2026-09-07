import type { Metadata } from "next";
import { Special_Elite, IM_Fell_English, Shadows_Into_Light } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const typewriter = Special_Elite({
  variable: "--font-typewriter",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const distressedSerif = IM_Fell_English({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Handwriting accent — used sparingly for margin annotations only.
const handwriting = Shadows_Into_Light({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Investigation Notebook — 1995–2012",
  description:
    "A forgotten investigation notebook. Property of Louisiana State Police. Confidential.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${typewriter.variable} ${distressedSerif.variable} ${handwriting.variable} antialiased investigation-root`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
