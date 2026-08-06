export type ShowroomArea = {
  slug: string;
  name: string;
  color: string;
  description: string;
  hint: string;
  keywords: string[];
  marker: { x: number; y: number };
  paths: string[];
};

export const showroomAreas: ShowroomArea[] = [
  {
    slug: "accoglienza",
    name: "Accoglienza",
    color: "#4f8955",
    description: "Informazioni, appuntamenti e primo orientamento nello showroom.",
    hint: "Si trova vicino all’ingresso principale, nella parte bassa della mappa.",
    keywords: ["reception", "ingresso", "informazioni", "appuntamento", "consulente"],
    marker: { x: 482, y: 1422 },
    paths: [
      "m 557.84981,1352.0767 -152.69956,0.4727 0.9455,157.4271 71.85862,0.4728 v -27.4198 l 28.838,-27.4197 h 51.05744 z",
    ],
  },
  {
    slug: "porte-finestre",
    name: "Porte e Finestre",
    color: "#e07a2f",
    description: "Porte interne, finestre, infissi e soluzioni per le aperture della casa.",
    hint: "Area arancio nella parte inferiore destra dello showroom.",
    keywords: ["porte", "porta", "finestre", "finestra", "infissi", "serramenti"],
    marker: { x: 806, y: 1392 },
    paths: [
      "m 911.97158,1511.5085 -16.18468,-0.7037 v -60.5167 l -83.73813,0.7037 -33.77672,28.1473 -42.92459,-41.5172 -8.44418,7.0368 -73.18291,-70.3682 15.481,-13.3699 -16.18468,-17.5921 87.96022,-81.6271 102.03386,13.37 67.55345,-1.4074 z",
    ],
  },
  {
    slug: "wellness",
    name: "Wellness",
    color: "#e3c33f",
    description: "Vasche, docce e soluzioni dedicate al benessere domestico.",
    hint: "Area gialla inclinata, tra Accoglienza e Porte e Finestre.",
    keywords: ["wellness", "benessere", "spa", "vasca", "vasche", "doccia", "docce"],
    marker: { x: 654, y: 1405 },
    paths: [
      "m 710.01491,1431.2887 -40.10986,39.4062 -73.88658,-71.7755 55.59086,-54.1835 14.07363,13.3699 -15.481,14.7773 z",
    ],
  },
  {
    slug: "cucine",
    name: "Cucine",
    color: "#2f6fb3",
    description: "Composizioni cucina, elettrodomestici, piani di lavoro e progettazione.",
    hint: "Grande area blu nella metà inferiore sinistra.",
    keywords: ["cucina", "cucine", "forno", "frigo", "lavastoviglie", "elettrodomestici", "bosch", "forma"],
    marker: { x: 516, y: 1244 },
    paths: [
      "m 402.41096,1348.0351 178.29389,0.8331 81.6486,-81.6486 -20.82873,-1.6663 1.6663,-114.9745 -239.11376,-0.8332 z",
    ],
  },
  {
    slug: "arredamento",
    name: "Arredamento",
    color: "#7656a8",
    description: "Living, camere, complementi e soluzioni per arredare gli ambienti.",
    hint: "Grande area viola sopra il reparto Cucine.",
    keywords: ["arredamento", "arredi", "mobili", "soggiorno", "living", "camera", "camere", "divani"],
    marker: { x: 525, y: 1085 },
    paths: [
      "m 406.57671,1022.2738 1.6663,122.4729 232.44857,1.6663 2.49944,-123.306 -75.81656,-0.8332 -4.99889,-12.4972 -75.81656,0.8331 v 9.1647 z",
    ],
  },
  {
    slug: "parquet-spc",
    name: "Parquet & SPC",
    color: "#58afc7",
    description: "Pavimenti in legno, laminati e superfici SPC.",
    hint: "Le aree celesti sono distribuite lungo il percorso espositivo.",
    keywords: ["parquet", "spc", "legno", "laminato", "pavimento legno", "pavimenti legno"],
    marker: { x: 526, y: 965 },
    paths: [
      "m 510.87297,425.72748 -35.18409,33.77672 57.70191,56.29454 50.66509,-48.55404 -33.07305,-33.07304 -16.88836,11.25891 z",
      "m 405.3207,1019.6349 h 78.10868 v -12.6663 h 83.73813 v 11.9626 l 73.88659,-0.7037 2.11104,-107.66328 -23.92518,-27.44359 -32.36936,33.77673 H 408.83911 Z",
    ],
  },
  {
    slug: "pavimenti-rivestimenti",
    name: "Pavimenti e Rivestimenti",
    color: "#c94a4a",
    description: "Ceramiche, gres, piastrelle e rivestimenti per ogni ambiente.",
    hint: "Le aree rosse seguono il percorso perimetrale e le pareti espositive.",
    keywords: ["pavimenti", "rivestimenti", "piastrelle", "mattonelle", "gres", "ceramica", "marmo"],
    marker: { x: 885, y: 770 },
    paths: [
      "m 913.37895,1274.3677 -25.33255,-0.7037 -2.11104,-199.8456 26.03622,-0.7037 z",
      "m 619.94365,426.43116 h 42.92458 l -0.70368,172.40203 47.14668,-0.70368 v 15.481 l -86.55286,1.40736 z",
      "m 658.64614,175.92044 2.11105,81.62709 75.29395,0.70368 v -56.99822 l 144.95845,-0.70368 2.81472,395.46916 h -36.59145 v 16.88836 h 64.03504 l 2.11105,-436.2827 z",
      "m 406.02439,328.61939 v 440.50479 l 36.59145,0.70368 -1.40737,-439.09742 z",
      "m 498.2067,377.17343 108.36699,1.40737 v 13.36995 L 498.2067,391.24707 Z",
      "m 468.65206,214.62294 2.81473,108.367 h -26.03622 l -1.40737,-108.367 z",
      "m 645.97987,921.82313 29.55464,1.40736 2.11104,340.58201 -28.85095,-0.7037 z",
      "m 707.69576,958.42226 0.674,64.02964 105.81737,2.022 0.67399,-62.68166 z",
    ],
  },
  {
    slug: "rubinetteria",
    name: "Rubinetteria",
    color: "#8faf8a",
    description: "Rubinetti, miscelatori e soluzioni coordinate per bagno e cucina.",
    hint: "Area verde salvia nella parte centrale sinistra.",
    keywords: ["rubinetteria", "rubinetti", "rubinetto", "miscelatori", "miscelatore"],
    marker: { x: 530, y: 840 },
    paths: [
      "m 476.56122,798.15674 109.97567,-1.6663 -0.83315,85.81434 -112.47511,-0.83315 z",
    ],
  },
  {
    slug: "sanitari",
    name: "Sanitari",
    color: "#d64f9a",
    description: "Lavabi, WC, bidet e collezioni coordinate per il bagno.",
    hint: "Le aree fucsia si trovano lungo il lato sinistro e in alto.",
    keywords: ["sanitari", "wc", "water", "bidet", "lavabo", "lavabi", "bagno"],
    marker: { x: 440, y: 842 },
    paths: [
      "m 407.40986,773.99541 64.15247,-0.83314 -0.83315,140.80218 -60.81988,-0.83315 z",
      "m 469.06288,888.96998 118.30716,-0.83315 v 25.82762 H 468.22973 Z",
      "m 490.72476,214.95244 0.83315,107.47622 24.16132,0.83315 -0.83315,-105.80992 z",
    ],
  },
  {
    slug: "accessori-bagno",
    name: "Accessori Bagno",
    color: "#5b616b",
    description: "Specchi, contenitori e accessori funzionali per completare il bagno.",
    hint: "Fascia grigio scuro al centro della mappa.",
    keywords: ["accessori", "accessori bagno", "specchi", "specchio", "mensole", "porta asciugamani"],
    marker: { x: 530, y: 782 },
    paths: [
      "m 477.39437,772.32912 v 20.82872 l 105.80993,-0.83315 v -19.99557 z",
    ],
  },
  {
    slug: "termoarredi",
    name: "Termoarredi",
    color: "#8a674e",
    description: "Radiatori e scaldasalviette per comfort e design.",
    hint: "Due fasce marroni nella zona centrale.",
    keywords: ["termoarredi", "termoarredo", "radiatori", "radiatore", "scaldasalviette", "termosifoni"],
    marker: { x: 648, y: 860 },
    paths: [
      "m 621.52915,805.65508 -9.16464,9.99778 55.82098,54.98784 10.83094,-9.99779 z",
      "m 635.69268,883.97108 8.33149,-10.83094 36.65856,36.65856 -8.33149,9.99779 z",
    ],
  },
  {
    slug: "servizi",
    name: "Servizi",
    color: "#e7a8b7",
    description: "Area dei servizi dello showroom.",
    hint: "Area rosa nella parte superiore centrale.",
    keywords: ["servizi", "toilette", "bagno clienti", "wc clienti"],
    marker: { x: 694, y: 318 },
    paths: [
      "m 654.02196,259.94249 v 114.97456 l 79.9823,0.83315 V 261.60878 Z",
    ],
  },
  {
    slug: "snack",
    name: "Snack",
    color: "#d6a216",
    description: "Punto ristoro e pausa all’interno dello showroom.",
    hint: "Piccola area oro nella parte superiore sinistra.",
    keywords: ["snack", "ristoro", "pausa", "caffè", "caffe", "acqua"],
    marker: { x: 500, y: 352 },
    paths: [
      "m 482.39327,329.927 v 44.99005 l 34.15911,-0.83315 1.66629,-44.1569 z",
    ],
  },
];
