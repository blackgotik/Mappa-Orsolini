import type { Metadata } from "next";
import { ShowroomMap } from "@/components/showroom-map";

export const metadata: Metadata = {
  title: "Esplora lo showroom | Orsolini Pomezia",
  description: "Trova reparti, prodotti e marchi nello showroom Orsolini di Pomezia.",
};

export default function MapPage() {
  return <ShowroomMap />;
}
