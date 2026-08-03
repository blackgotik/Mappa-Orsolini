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
- L'elenco dei reparti è disposto come menu verticale a fisarmonica e usa automaticamente i colori definiti in `data/areas.ts`.
- Ogni reparto mostra il conteggio e il menu dei marchi presenti; selezionando un marchio si attivano ricerca, retino e zoom automatico.
- La planimetria pubblica usa una base originale senza retini: il colore si accende soltanto sul risultato selezionato.
- Le superfici fisiche associate ai marchi vengono evidenziate con il colore del reparto; i sei punti già pubblicati hanno un perimetro dedicato.
- Zoom automatico per inquadrare insieme tutti i risultati dello stesso marchio.
- Zoom manuale e adattamento mobile.
- Modalità rilievo marchi disponibile aggiungendo `?editor=1` all’indirizzo.
- Salvataggio automatico dei segnaposto nel browser.
- Spostamento dei punti tramite trascinamento ed eliminazione dall’elenco.
- Esportazione del file `marchi-orsolini.json` per la pubblicazione definitiva.
- Pubblicazione dei marchi tramite sostituzione diretta di `data/marchi-orsolini.json`; i perimetri già tracciati restano in `data/brand-zones.ts`.
- Elenco aggiornato a 60 segnaposti e 51 marchi distinti, raggruppati automaticamente nei rispettivi reparti.

## Rilievo dei marchi

Aprire, per esempio, `http://localhost:3000/?editor=1`. Inserire il nome del marchio, scegliere il reparto e toccare la posizione sulla planimetria. Il punto può essere trascinato per correggerlo. Al termine usare **Esporta elenco** e conservare il file JSON.
