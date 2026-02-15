import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://voca-cola-zero.netlify.app"),
  title: "Voca Cola Zero — Daily Self-Improvement",
  description:
      "매일 신선하게 배달되는 4가지 챌린지. 비용 제로, 노력 제로.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Voca Cola Zero",
    description: "매일 신선하게 배달되는 4가지 챌린지. 비용 제로, 노력 제로.",
    url: "https://voca-cola-zero.netlify.app",
    siteName: "Voca Cola Zero",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Voca Cola Zero",
      },
    ],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap"
        />
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className={inter.variable}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
