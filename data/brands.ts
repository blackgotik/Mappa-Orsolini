import exportedBrandData from "@/data/marchi-orsolini.json";
import { brandZones } from "@/data/brand-zones";

export type BrandMarker = {
  id: string;
  name: string;
  areaSlug: string;
  x: number;
  y: number;
  zonePath?: string;
};

type ExportedBrandFile = {
  brands: Array<Omit<BrandMarker, "zonePath"> & { zonePath?: string }>;
};

const exportedBrands = (exportedBrandData as ExportedBrandFile).brands;

// I punti arrivano direttamente dal JSON esportato dalla modalità rilievo.
// I perimetri vettoriali restano separati, così non vengono persi sostituendo il JSON.
export const publishedBrands: BrandMarker[] = exportedBrands.map((brand) => ({
  ...brand,
  zonePath: brand.zonePath ?? brandZones[brand.id],
}));
