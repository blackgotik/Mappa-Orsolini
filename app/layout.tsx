import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Benvenuti nello showroom Orsolini Pomezia",
  description: "Esplora lo showroom Orsolini di Pomezia e trova reparti, prodotti e marchi.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
