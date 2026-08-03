import canonicalBrandData from "@/data/marchi-orsolini.json";
import sourceAssetBrandData from "@/source-assets/marchi-orsolini.json";
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
  exportedAt?: string;
  brands: Array<Omit<BrandMarker, "zonePath"> & { zonePath?: string }>;
};

const brandFiles = [canonicalBrandData, sourceAssetBrandData] as ExportedBrandFile[];
const exportedBrandData = brandFiles.reduce((latest, candidate) => {
  const latestTime = Date.parse(latest.exportedAt ?? "");
  const candidateTime = Date.parse(candidate.exportedAt ?? "");

  if (Number.isNaN(candidateTime)) return latest;
  if (Number.isNaN(latestTime) || candidateTime > latestTime) return candidate;
  return latest;
});
const exportedBrands = exportedBrandData.brands;
export const publishedBrandsExportedAt = exportedBrandData.exportedAt ?? "";

// Tra data e source-assets viene usato automaticamente il JSON esportato più recente.
// I perimetri vettoriali restano separati, così non vengono persi sostituendo il JSON.
export const publishedBrands: BrandMarker[] = exportedBrands.map((brand) => ({
  ...brand,
  zonePath: brand.zonePath ?? brandZones[brand.id],
}));
