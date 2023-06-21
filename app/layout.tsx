//
//  layout.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 29 Apr 2023
//

import { layout, meta } from "@d-exclaimation/next";
import Navicon from "~/components/NavIcon";
import "./globals.css";

const RootLayout = layout(({ children }) => {
  return (
    <html lang="en" className="bg-white dark:bg-black">
      <body className="min-w-screen min-h-screen grid place-items-center">
        <Navicon />
        <main className="z-10 relative min-w-screen min-h-screen flex items-center justify-center">
          {children}
        </main>
      </body>
    </html>
  );
});

export const metadata = meta({
  title: "d-exclaimation",
  description: "My work, my art, my life",
  twitter: {
    images: "/me.gif",
    title: "d-exclaimation",
    description: "My work, my art, my life",
    card: "summary_large_image",
    creator: "@dexclaimation",
  },
  openGraph: {
    images: "/me.gif",
    title: "d-exclaimation",
    description: "My work, my art, my life",
    url: "https://d-exclaimation.me",
    type: "article",
    siteName: "d-exclaimation",
  },
  icons: {
    icon: [
      "/favicon.ico",
      { sizes: "16x16", url: "/favicon-16x16.png" },
      { sizes: "32x32", url: "/favicon-32x32.png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  viewport: {
    initialScale: 1,
    width: "device-width",
    viewportFit: "cover",
  },
  manifest: "/site.webmanifest",
});

export default RootLayout;
