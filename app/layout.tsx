import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMART Consulting Navigator",
  description: "Geführte Beratungsgespräche für Bau, Immobilien, KI-Prozesse und Projektanalyse.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
