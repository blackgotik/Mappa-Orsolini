"use client";

import Image from "next/image";
import { FormEvent, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { showroomAreas } from "@/data/areas";

type BrandMarker = {
  id: string;
  name: string;
  areaSlug: string;
  x: number;
  y: number;
};

type MapPoint = { x: number; y: number };

const STORAGE_KEY = "orsolini-brand-markers-v1";
const VIEWBOX_WIDTH = 1122.6667;
const VIEWBOX_HEIGHT = 1588;

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("it")
    .trim();

export function ShowroomMap() {
  const [query, setQuery] = useState("");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [editorMode, setEditorMode] = useState(false);
  const [brandMarkers, setBrandMarkers] = useState<BrandMarker[]>([]);
  const [brandsLoaded, setBrandsLoaded] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftAreaSlug, setDraftAreaSlug] = useState(showroomAreas[0].slug);
  const [pendingPoint, setPendingPoint] = useState<MapPoint | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [draggingBrandId, setDraggingBrandId] = useState<string | null>(null);
  const interactionSvgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEditorMode(params.get("editor") === "1");

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { brands?: BrandMarker[] } | BrandMarker[];
        const storedBrands = Array.isArray(parsed) ? parsed : parsed.brands;
        if (Array.isArray(storedBrands)) setBrandMarkers(storedBrands);
      }
    } catch {
      // An invalid local draft should not prevent the public map from loading.
    } finally {
      setBrandsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!brandsLoaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, brands: brandMarkers }));
  }, [brandMarkers, brandsLoaded]);

  const activeArea = showroomAreas.find((area) => area.slug === activeSlug) ?? null;
  const highlightedAreaSlug = editorMode ? draftAreaSlug : activeSlug;
  const matches = useMemo(() => {
    const term = normalize(query);
    if (!term) return [];

    return showroomAreas
      .map((area) => {
        const values = [area.name, ...area.keywords].map(normalize);
        const exact = values.some((value) => value === term);
        const starts = values.some((value) => value.startsWith(term));
        const includes = values.some((value) => value.includes(term) || term.includes(value));
        return { area, score: exact ? 3 : starts ? 2 : includes ? 1 : 0 };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ area }) => area)
      .slice(0, 5);
  }, [query]);

  function selectArea(slug: string) {
    const area = showroomAreas.find((item) => item.slug === slug);
    if (!area) return;
    setActiveSlug(slug);
    setQuery(area.name);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (matches[0]) selectArea(matches[0].slug);
  }

  function clearSearch() {
    setQuery("");
    setActiveSlug(null);
  }

  function pointFromPointer(event: ReactPointerEvent<SVGSVGElement>): MapPoint | null {
    const svg = interactionSvgRef.current;
    if (!svg) return null;
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;

    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return {
      x: Math.max(0, Math.min(VIEWBOX_WIDTH, Math.round(point.x * 100) / 100)),
      y: Math.max(0, Math.min(VIEWBOX_HEIGHT, Math.round(point.y * 100) / 100)),
    };
  }

  function handleMapPointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    if (!editorMode) return;
    const point = pointFromPointer(event);
    if (!point) return;

    if (draggingBrandId) {
      setBrandMarkers((markers) =>
        markers.map((marker) => (marker.id === draggingBrandId ? { ...marker, ...point } : marker)),
      );
      return;
    }

    setPendingPoint(point);
    setSelectedBrandId(null);
  }

  function handleMapPointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (!editorMode || !draggingBrandId) return;
    const point = pointFromPointer(event);
    if (!point) return;
    setBrandMarkers((markers) =>
      markers.map((marker) => (marker.id === draggingBrandId ? { ...marker, ...point } : marker)),
    );
  }

  function addBrandMarker() {
    const name = draftName.trim();
    if (!name || !pendingPoint) return;

    const marker: BrandMarker = {
      id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${name}`,
      name,
      areaSlug: draftAreaSlug,
      ...pendingPoint,
    };

    setBrandMarkers((markers) => [...markers, marker]);
    setSelectedBrandId(marker.id);
    setDraftName("");
    setPendingPoint(null);
  }

  function deleteBrandMarker(id: string) {
    setBrandMarkers((markers) => markers.filter((marker) => marker.id !== id));
    if (selectedBrandId === id) setSelectedBrandId(null);
  }

  function exportBrandMarkers() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      viewBox: { width: VIEWBOX_WIDTH, height: VIEWBOX_HEIGHT },
      brands: brandMarkers,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "marchi-orsolini.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function exitEditor() {
    window.location.assign(window.location.pathname);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand" aria-label="Orsolini">
          <span className="brand-mark" aria-hidden="true">O</span>
          <span>
            <strong>ORSOLINI</strong>
            <small>Showroom Pomezia</small>
          </span>
        </div>
        <span className="prototype-badge">{editorMode ? "Rilievo marchi" : "Mappa interattiva"}</span>
      </header>

      <section className="workspace">
        <aside className="search-panel">
          {editorMode ? (
            <div className="editor-panel">
              <div className="panel-copy">
                <p className="eyebrow">Modalità rilievo</p>
                <h1>Posiziona i marchi</h1>
                <p>Scrivi il marchio, scegli il reparto e tocca il punto esatto sulla planimetria.</p>
              </div>

              <div className="editor-form">
                <label>
                  <span>Nome del marchio</span>
                  <input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    placeholder="Es. Bosch"
                    autoComplete="off"
                  />
                </label>
                <label>
                  <span>Reparto</span>
                  <select value={draftAreaSlug} onChange={(event) => setDraftAreaSlug(event.target.value)}>
                    {showroomAreas.map((area) => (
                      <option value={area.slug} key={area.slug}>{area.name}</option>
                    ))}
                  </select>
                </label>

                <div className={`coordinate-status${pendingPoint ? " has-point" : ""}`}>
                  <span aria-hidden="true">⌖</span>
                  {pendingPoint ? (
                    <span>Punto selezionato: X {pendingPoint.x}, Y {pendingPoint.y}</span>
                  ) : (
                    <span>Ora tocca la posizione sulla mappa</span>
                  )}
                </div>

                <button
                  className="editor-primary"
                  type="button"
                  onClick={addBrandMarker}
                  disabled={!draftName.trim() || !pendingPoint}
                >
                  Aggiungi segnaposto
                </button>
              </div>

              <div className="brand-list-heading">
                <strong>Marchi rilevati</strong>
                <span>{brandMarkers.length}</span>
              </div>

              <div className="brand-list">
                {brandMarkers.length === 0 ? (
                  <p>Nessun marchio registrato.</p>
                ) : (
                  brandMarkers.map((marker) => {
                    const area = showroomAreas.find((item) => item.slug === marker.areaSlug);
                    return (
                      <div className={`brand-row${selectedBrandId === marker.id ? " is-selected" : ""}`} key={marker.id}>
                        <button
                          type="button"
                          className="brand-select"
                          onClick={() => {
                            setSelectedBrandId(marker.id);
                            setDraftAreaSlug(marker.areaSlug);
                          }}
                        >
                          <span className="color-dot" style={{ backgroundColor: area?.color }} />
                          <span>
                            <strong>{marker.name}</strong>
                            <small>{area?.name} · X {marker.x}, Y {marker.y}</small>
                          </span>
                        </button>
                        <button className="brand-delete" type="button" onClick={() => deleteBrandMarker(marker.id)} aria-label={`Elimina ${marker.name}`}>×</button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="editor-actions">
                <button type="button" onClick={exportBrandMarkers} disabled={brandMarkers.length === 0}>Esporta elenco</button>
                <button type="button" onClick={exitEditor}>Esci dal rilievo</button>
              </div>
            </div>
          ) : (
            <>
              <div className="panel-copy">
                <p className="eyebrow">Trova ciò che cerchi</p>
                <h1>Dove vuoi andare?</h1>
                <p>Cerca un reparto, un prodotto o un marchio presente nello showroom.</p>
              </div>

              <div className="search-wrap">
                <form className="search-box" onSubmit={handleSubmit} role="search">
                  <span className="search-icon" aria-hidden="true">⌕</span>
                  <input
                    aria-label="Cerca nella mappa"
                    autoComplete="off"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setActiveSlug(null);
                    }}
                    placeholder="Es. cucine, parquet, lavabo…"
                  />
                  {query ? (
                    <button className="clear-button" type="button" onClick={clearSearch} aria-label="Cancella ricerca">
                      ×
                    </button>
                  ) : null}
                </form>

                {query && !activeArea ? (
                  <div className="suggestions" aria-live="polite">
                    {matches.length > 0 ? (
                      matches.map((area) => (
                        <button type="button" key={area.slug} onClick={() => selectArea(area.slug)}>
                          <span className="color-dot" style={{ backgroundColor: area.color }} />
                          <span>{area.name}</span>
                          <span aria-hidden="true">→</span>
                        </button>
                      ))
                    ) : (
                      <p>Nessun risultato. Prova con “bagno”, “gres” o “cucine”.</p>
                    )}
                  </div>
                ) : null}
              </div>

              {activeArea ? (
                <article className="area-card" style={{ "--area-color": activeArea.color } as React.CSSProperties}>
                  <div className="area-card-heading">
                    <span className="area-number">{String(showroomAreas.indexOf(activeArea) + 1).padStart(2, "0")}</span>
                    <div>
                      <p>Reparto</p>
                      <h2>{activeArea.name}</h2>
                    </div>
                  </div>
                  <p>{activeArea.description}</p>
                  <div className="position-hint">
                    <span aria-hidden="true">⌖</span>
                    <span>{activeArea.hint}</span>
                  </div>
                  <button className="reset-link" type="button" onClick={clearSearch}>Nuova ricerca</button>
                </article>
              ) : (
                <div className="search-examples">
                  <span>Prova a cercare</span>
                  <button onClick={() => selectArea("cucine")}>Cucine</button>
                  <button onClick={() => selectArea("sanitari")}>Sanitari</button>
                  <button onClick={() => selectArea("parquet-spc")}>Parquet</button>
                </div>
              )}

              <p className="prototype-note">Prototipo iniziale: i marchi specifici verranno aggiunti nel prossimo passaggio.</p>
            </>
          )}
        </aside>

        <section className="map-panel" aria-label="Planimetria interattiva dello showroom">
          <div className="map-tools" aria-label="Controlli di ingrandimento">
            <button type="button" onClick={() => setZoom((value) => Math.min(2, value + 0.25))} aria-label="Ingrandisci">+</button>
            <span>{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => setZoom((value) => Math.max(0.75, value - 0.25))} aria-label="Riduci">−</button>
          </div>

          <div className="map-viewport">
            <div className="map-canvas" style={{ width: `${zoom * 100}%` }}>
              <Image
                src="/planimetria-orsolini.svg"
                alt="Planimetria dello showroom Orsolini Pomezia"
                fill
                priority
                unoptimized
                sizes="(max-width: 800px) 100vw, 70vw"
              />

              <svg
                ref={interactionSvgRef}
                className={`interaction-layer${editorMode ? " is-editor" : ""}`}
                viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
                role="img"
                aria-label={editorMode ? "Posizionamento dei marchi sulla planimetria" : "Aree cliccabili della planimetria"}
                onPointerDown={handleMapPointerDown}
                onPointerMove={handleMapPointerMove}
                onPointerUp={() => setDraggingBrandId(null)}
                onPointerCancel={() => setDraggingBrandId(null)}
              >
                <defs>
                  <filter id="active-glow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="7" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {showroomAreas.map((area) => {
                  const isActive = area.slug === highlightedAreaSlug;
                  return (
                    <g
                      className={`map-area${isActive ? " is-active" : ""}${highlightedAreaSlug && !isActive ? " is-muted" : ""}`}
                      key={area.slug}
                      role="button"
                      tabIndex={0}
                      aria-label={editorMode ? `Posiziona nel reparto ${area.name}` : `Apri il reparto ${area.name}`}
                      onClick={() => {
                        if (editorMode) setDraftAreaSlug(area.slug);
                        else selectArea(area.slug);
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter" && event.key !== " ") return;
                        if (editorMode) setDraftAreaSlug(area.slug);
                        else selectArea(area.slug);
                      }}
                    >
                      {area.paths.map((path, index) => (
                        <path key={`${area.slug}-${index}`} d={path} fill={area.color} />
                      ))}
                    </g>
                  );
                })}

                {activeArea && !editorMode ? (
                  <g className="active-marker" transform={`translate(${activeArea.marker.x} ${activeArea.marker.y})`} aria-hidden="true">
                    <circle className="marker-pulse" r="31" fill={activeArea.color} />
                    <circle className="marker-core" r="16" fill="#ffffff" stroke={activeArea.color} strokeWidth="8" />
                  </g>
                ) : null}

                {editorMode && pendingPoint ? (
                  <g className="pending-marker" transform={`translate(${pendingPoint.x} ${pendingPoint.y})`} aria-hidden="true">
                    <circle r="25" />
                    <path d="M -34 0 H 34 M 0 -34 V 34" />
                  </g>
                ) : null}

                {editorMode ? brandMarkers.map((marker) => {
                  const area = showroomAreas.find((item) => item.slug === marker.areaSlug);
                  const labelWidth = Math.max(120, marker.name.length * 16 + 36);
                  const selected = marker.id === selectedBrandId;
                  return (
                    <g
                      className={`brand-map-marker${selected ? " is-selected" : ""}`}
                      transform={`translate(${marker.x} ${marker.y})`}
                      key={marker.id}
                      onPointerDown={(event) => {
                        event.stopPropagation();
                        setSelectedBrandId(marker.id);
                        setDraftAreaSlug(marker.areaSlug);
                        setDraggingBrandId(marker.id);
                        event.currentTarget.setPointerCapture(event.pointerId);
                      }}
                      onPointerUp={(event) => {
                        setDraggingBrandId(null);
                        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                          event.currentTarget.releasePointerCapture(event.pointerId);
                        }
                      }}
                    >
                      <rect x={-labelWidth / 2} y={-74} width={labelWidth} height="40" rx="10" />
                      <text x="0" y="-47">{marker.name}</text>
                      <path className="brand-pin" d="M 0,-24 C -17,-24 -27,-13 -27,1 C -27,20 0,42 0,42 C 0,42 27,20 27,1 C 27,-13 17,-24 0,-24 Z" fill={area?.color ?? "#2f694a"} />
                      <circle r="8" />
                    </g>
                  );
                }) : null}

                <g className="entrance-marker" transform="translate(566 1545)" aria-hidden="true">
                  <path d="M 0 22 V -8 M -12 4 L 0 -10 L 12 4" />
                  <text x="0" y="42">INGRESSO</text>
                </g>
              </svg>
            </div>
          </div>

          <p className="map-help">
            {editorMode ? "Tocca un punto per posizionarlo. Trascina un segnaposto già salvato per correggerlo." : "Tocca direttamente un’area colorata oppure usa la ricerca."}
          </p>
        </section>
      </section>
    </main>
  );
}
