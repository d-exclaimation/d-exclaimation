//
//  layout.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 29 Apr 2023
//

import { head } from "../next/metadata";
import { rc } from "../next/rc";
import "./globals.css";

type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout = rc<RootLayoutProps>(({ children }) => {
  return (
    <html lang="en">
      <body className="min-w-screen min-h-screen grid place-items-center bg-gradient-to-t from-neutral-300">
        <div
          className="z-0 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex place-items-center 
          before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full 
          before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] 
          after:absolute after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic 
          after:from-indigo-100 after:via-blue-100 after:blur-2xl after:content-[''] before:lg:h-[360px]"
        />
        <main className="z-10 relative min-w-screen min-h-screen flex items-center justify-center">
          {children}
        </main>
      </body>
    </html>
  );
});

export const metadata = head({
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
});

export default RootLayout;
