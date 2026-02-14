import type { Metadata, Viewport } from "next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  metadataBase: new URL("https://voca-cola-zero.netlify.app"),
  title: "Voca Cola Zero — AI Daily Vocabulary",
  description:
      "매일 아침 AI로부터 신선하게 배달되는 단어. 비용 제로, 노력 제로.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Voca Cola Zero",
    description: "매일 아침 AI로부터 신선하게 배달되는 단어. 비용 제로, 노력 제로.",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
