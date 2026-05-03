import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PIPPIT CREATION — Media Manager",
  description:
    "High-performance media management system for the PIPPIT CREATION animated series. Upload, process, and stream assets via AWS S3 and CloudFront.",
  keywords: ["PIPPIT", "animation", "media management", "AWS S3", "CloudFront"],
  openGraph: {
    title: "PIPPIT CREATION — Media Manager",
    description: "Manage animation assets at scale with real-time updates.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
