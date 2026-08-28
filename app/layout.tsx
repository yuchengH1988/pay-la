import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { I18nProvider } from "@/src/i18n";
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
  metadataBase: new URL("https://pay-la.calvin-huang.com"),
  title: "Pay La",
  description: "Shared expense tracking and settlement.",
  openGraph: {
    title: "Pay La",
    description: "Shared expense tracking and settlement.",
    url: "https://pay-la.calvin-huang.com",
    siteName: "Pay La",
    images: [
      {
        url: "/og/pay-la-og.jpg",
        width: 1200,
        height: 630,
        alt: "Pay La shared expense app",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pay La",
    description: "Shared expense tracking and settlement.",
    images: ["/og/pay-la-og.jpg"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
