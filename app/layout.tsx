import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mappa Showroom Orsolini Pomezia",
  description: "Trova reparti, prodotti e marchi nello showroom Orsolini di Pomezia.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
