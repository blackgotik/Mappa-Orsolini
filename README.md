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
- Logo e colori istituzionali ripresi dal sito ufficiale Orsolini.
- Evidenziazione delle aree con geometrie vettoriali originali.
- Selezione diretta delle aree sulla mappa.
- I segnaposti dei marchi restano nascosti finché non viene selezionato un risultato.
- La planimetria pubblica resta neutra: il retino colorato si accende soltanto sul risultato selezionato.
- Le superfici fisiche associate ai marchi vengono evidenziate con il colore del reparto; i sei punti già pubblicati hanno un perimetro dedicato.
- Zoom automatico per inquadrare insieme tutti i risultati dello stesso marchio.
- Zoom manuale e adattamento mobile.
- Modalità rilievo marchi disponibile aggiungendo `?editor=1` all’indirizzo.
- Salvataggio automatico dei segnaposto nel browser.
- Spostamento dei punti tramite trascinamento ed eliminazione dall’elenco.
- Esportazione del file `marchi-orsolini.json` per la pubblicazione definitiva.
- Sei segnaposto già pubblicati e ricercabili: Valentina, Francesca, Target Point, Forma Cucine COLIBRÌ, Marazzi e Glass.

## Rilievo dei marchi

Aprire, per esempio, `http://localhost:3000/?editor=1`. Inserire il nome del marchio, scegliere il reparto e toccare la posizione sulla planimetria. Il punto può essere trascinato per correggerlo. Al termine usare **Esporta elenco** e conservare il file JSON.
