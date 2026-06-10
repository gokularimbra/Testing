import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gadcet — Premium Gadget Repair",
  description:
    "Fast, reliable, and efficient gadget repair. No appointment needed. 12-month warranty on all repairs.",
  keywords: "gadget repair, phone repair, laptop repair, tablet repair, gaming console repair",
  openGraph: {
    title: "Gadcet — Premium Gadget Repair",
    description: "Fast, reliable, and efficient gadget repair. No appointment needed.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
