# Mappa interattiva Orsolini — prototipo

Applicazione Next.js pronta per Vercel che rende ricercabili e cliccabili le 13 macroaree dello showroom di Pomezia.

## Avvio sul computer

```bash
npm install
npm run dev
```

Aprire `http://localhost:3000`.

## Pubblicazione su Vercel

1. Importare la cartella in un repository Git oppure aprirla nel terminale.
2. Eseguire `npx vercel` per creare un’anteprima.
3. Eseguire `npx vercel --prod` soltanto dopo l’approvazione.

## Dove aggiornare i contenuti

- `data/areas.ts`: nomi, descrizioni, sinonimi, colori, coordinate e geometrie.
- `public/planimetria-orsolini.svg`: planimetria mostrata nell’app.
- `source-assets/`: copie dei due file originali forniti.

## Stato del prototipo

- Ricerca per reparto e termini associati.
- Evidenziazione delle aree con geometrie vettoriali originali.
- Selezione diretta delle aree sulla mappa.
- Zoom e adattamento mobile.
- Dati dei marchi ancora da inserire.
