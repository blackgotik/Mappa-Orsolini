export type BrandMarker = {
  id: string;
  name: string;
  areaSlug: string;
  x: number;
  y: number;
};

// Segnaposto pubblicati dal rilievo esportato il 2 agosto 2026.
export const publishedBrands: BrandMarker[] = [
  {
    id: "50325129-5ad6-415d-a63f-11647fec9996",
    name: "Valentina",
    areaSlug: "accoglienza",
    x: 461.69,
    y: 1345.16,
  },
  {
    id: "df041aa6-5736-4eba-b67d-7b606cdee377",
    name: "Francesca",
    areaSlug: "accoglienza",
    x: 434.17,
    y: 1368.59,
  },
  {
    id: "5823311a-3693-460d-908b-0cd7f0ee9860",
    name: "Target Point",
    areaSlug: "arredamento",
    x: 607.08,
    y: 1208.83,
  },
  {
    id: "1efdc86a-29e4-4c78-9b09-f4b25a8f72cf",
    name: "Forma Cucine COLIBRÌ",
    areaSlug: "cucine",
    x: 563.81,
    y: 1261.97,
  },
  {
    id: "94573e01-908d-4d51-8b56-b50e27667baa",
    name: "Marazzi",
    areaSlug: "pavimenti-rivestimenti",
    x: 742.43,
    y: 1178.05,
  },
  {
    id: "2561eddd-2833-4f8b-8b7a-cd5d8c0c3d23",
    name: "Glass",
    areaSlug: "wellness",
    x: 621.96,
    y: 1348.93,
  },
];
