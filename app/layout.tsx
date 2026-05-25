import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HireQ",
  description: "Generate role-specific interview questions powered by AI",
  icons: {
    icon: "/app-icon.png",
    apple: "/app-icon.png",
  },
  openGraph: {
    title: "HireQ",
    description: "Generate role-specific interview questions powered by AI",
    images: [{ url: "/logo.jpg", width: 1200, height: 630, alt: "HireQ" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HireQ",
    description: "Generate role-specific interview questions powered by AI",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
