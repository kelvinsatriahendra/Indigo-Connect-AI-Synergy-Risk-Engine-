import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "Indigo Connect — AI Synergy & Risk Engine",
  description: "Executive Analytics Dashboard untuk evaluasi kesehatan startup dan rekomendasi sinergi Telkom",
};

export const viewport: Viewport = {
  themeColor: "#875bf7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔮</text></svg>" />
      </head>
      <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
