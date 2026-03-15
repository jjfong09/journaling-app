import type { Metadata, Viewport } from "next";
import { Averia_Serif_Libre, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import PageTransition from "./PageTransition";

const averiaSerif = Averia_Serif_Libre({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Journal",
  description: "Personal journal and scrapbook",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${averiaSerif.variable} ${inter.variable} ${ibmPlexMono.variable}`}>
      <body>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
