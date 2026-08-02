"use client";

import Image from "next/image";
import { FormEvent, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { showroomAreas } from "@/data/areas";
import { publishedBrands, type BrandMarker } from "@/data/brands";

type MapPoint = { x: number; y: number };
type SearchMatch = {
  kind: "area" | "brand";
  id: string;
  label: string;
  areaSlug: string;
  color: string;
  score: number;
};

const STORAGE_KEY = "orsolini-brand-markers-v1";
const VIEWBOX_WIDTH = 1122.6667;
const VIEWBOX_HEIGHT = 1588;

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("it")
    .trim();

function getMatchScore(values: string[], term: string) {
  const normalizedValues = values.map(normalize);
  if (normalizedValues.some((value) => value === term)) return 3;
  if (normalizedValues.some((value) => value.startsWith(term))) return 2;
  if (normalizedValues.some((value) => value.includes(term) || term.includes(value))) return 1;
  return 0;
}

export function ShowroomMap() {
  const [query, setQuery] = useState("");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
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
  const mapViewportRef = useRef<HTMLDivElement>(null);
  const mapCanvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEditorMode(params.get("editor") === "1");

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { brands?: BrandMarker[] } | BrandMarker[];
        const storedBrands = Array.isArray(parsed) ? parsed : parsed.brands;
        if (Array.isArray(storedBrands)) setBrandMarkers(storedBrands);
        else setBrandMarkers(publishedBrands.map((brand) => ({ ...brand })));
      } else {
        setBrandMarkers(publishedBrands.map((brand) => ({ ...brand })));
      }
    } catch {
      // An invalid local draft should not prevent the public map from loading.
      setBrandMarkers(publishedBrands.map((brand) => ({ ...brand })));
    } finally {
      setBrandsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!brandsLoaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, brands: brandMarkers }));
  }, [brandMarkers, brandsLoaded]);

  const activeArea = showroomAreas.find((area) => area.slug === activeSlug) ?? null;
  const activeBrand = publishedBrands.find((brand) => brand.id === activeBrandId) ?? null;
  const activeBrandResults = useMemo(() => {
    if (!activeBrand) return [];
    const brandName = normalize(activeBrand.name);
    return publishedBrands.filter((brand) => normalize(brand.name) === brandName);
  }, [activeBrand]);
  const activeBrandArea = activeBrand
    ? showroomAreas.find((area) => area.slug === activeBrand.areaSlug) ?? null
    : null;
  const activeBrandAreas = useMemo(
    () => Array.from(new Set(activeBrandResults.map((brand) => brand.areaSlug)))
      .map((slug) => showroomAreas.find((area) => area.slug === slug))
      .filter((area): area is (typeof showroomAreas)[number] => Boolean(area)),
    [activeBrandResults],
  );
  const highlightedAreaSlug = editorMode ? draftAreaSlug : activeBrand ? null : activeSlug;
  const matches = useMemo(() => {
    const term = normalize(query);
    if (!term) return [];

    const areaMatches: SearchMatch[] = showroomAreas.map((area) => ({
      kind: "area",
      id: area.slug,
      label: area.name,
      areaSlug: area.slug,
      color: area.color,
      score: getMatchScore([area.name, ...area.keywords], term),
    }));
    const brandMatchesByName = new Map<string, SearchMatch>();
    publishedBrands.forEach((brand) => {
      const area = showroomAreas.find((item) => item.slug === brand.areaSlug);
      const match = {
        kind: "brand",
        id: brand.id,
        label: brand.name,
        areaSlug: brand.areaSlug,
        color: area?.color ?? "#1e73be",
        score: getMatchScore([brand.name], term),
      } satisfies SearchMatch;
      const key = normalize(brand.name);
      const current = brandMatchesByName.get(key);
      if (!current || match.score > current.score) brandMatchesByName.set(key, match);
    });
    const brandMatches = Array.from(brandMatchesByName.values());

    return [...brandMatches, ...areaMatches]
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [query]);

  useEffect(() => {
    if (editorMode) return;

    const viewport = mapViewportRef.current;
    if (!viewport) return;

    const points = activeBrandResults.length > 0
      ? activeBrandResults.map(({ x, y }) => ({ x, y }))
      : activeArea
        ? [activeArea.marker]
        : [];

    if (points.length === 0) {
      setZoom(1);
      viewport.scrollTo({ left: 0, top: 0, behavior: "smooth" });
      return;
    }

    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    let nextZoom = activeBrandResults.length > 0 ? 1.65 : 1.25;
    if (points.length > 1) {
      const paddedWidth = Math.max(150, maxX - minX + 170);
      const paddedHeight = Math.max(150, maxY - minY + 170);
      const horizontalFit = (VIEWBOX_WIDTH * 0.82) / paddedWidth;
      const verticalFit = (viewport.clientHeight * VIEWBOX_WIDTH * 0.78)
        / (Math.max(viewport.clientWidth, 1) * paddedHeight);
      nextZoom = Math.max(0.85, Math.min(1.75, horizontalFit, verticalFit));
    }

    setZoom(nextZoom);
    const timer = window.setTimeout(() => {
      const canvas = mapCanvasRef.current;
      const currentViewport = mapViewportRef.current;
      if (!canvas || !currentViewport) return;

      const scaleX = canvas.scrollWidth / VIEWBOX_WIDTH;
      const scaleY = canvas.scrollHeight / VIEWBOX_HEIGHT;
      const left = centerX * scaleX - currentViewport.clientWidth / 2;
      const top = centerY * scaleY - currentViewport.clientHeight / 2;
      currentViewport.scrollTo({
        left: Math.max(0, left),
        top: Math.max(0, top),
        behavior: "smooth",
      });
    }, 240);

    return () => window.clearTimeout(timer);
  }, [activeArea, activeBrandResults, editorMode]);

  function selectArea(slug: string) {
    const area = showroomAreas.find((item) => item.slug === slug);
    if (!area) return;
    setActiveSlug(slug);
    setActiveBrandId(null);
    setQuery(area.name);
  }

  function selectBrand(id: string) {
    const brand = publishedBrands.find((item) => item.id === id);
    if (!brand) return;
    setActiveBrandId(id);
    setActiveSlug(brand.areaSlug);
    setQuery(brand.name);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const first = matches[0];
    if (!first) return;
    if (first.kind === "brand") selectBrand(first.id);
    else selectArea(first.areaSlug);
  }

  function clearSearch() {
    setQuery("");
    setActiveSlug(null);
    setActiveBrandId(null);
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
          <Image
            className="brand-logo"
            src="/logo-orsolini.png"
            width={186}
            height={46}
            alt="Orsolini — Dal 1880 Cultura della Casa"
            priority
          />
          <span className="brand-location">Showroom Pomezia</span>
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
                      setActiveBrandId(null);
                    }}
                    placeholder="Es. cucine, parquet, lavabo…"
                  />
                  {query ? (
                    <button className="clear-button" type="button" onClick={clearSearch} aria-label="Cancella ricerca">
                      ×
                    </button>
                  ) : null}
                </form>

                {query && !activeArea && !activeBrand ? (
                  <div className="suggestions" aria-live="polite">
                    {matches.length > 0 ? (
                      matches.map((match) => (
                        <button
                          type="button"
                          key={`${match.kind}-${match.id}`}
                          onClick={() => match.kind === "brand" ? selectBrand(match.id) : selectArea(match.areaSlug)}
                        >
                          <span className="color-dot" style={{ backgroundColor: match.color }} />
                          <span>{match.label} <small>{match.kind === "brand" ? "Marchio" : "Reparto"}</small></span>
                          <span aria-hidden="true">→</span>
                        </button>
                      ))
                    ) : (
                      <p>Nessun risultato. Prova con “bagno”, “gres” o “cucine”.</p>
                    )}
                  </div>
                ) : null}
              </div>

              {activeBrand && activeBrandArea ? (
                <article className="area-card brand-card" style={{ "--area-color": activeBrandArea.color } as React.CSSProperties}>
                  <div className="area-card-heading">
                    <span className="area-number">⌖</span>
                    <div>
                      <p>Marchio o punto</p>
                      <h2>{activeBrand.name}</h2>
                    </div>
                  </div>
                  <p>
                    {activeBrandResults.length > 1
                      ? `Trovi ${activeBrand.name} in ${activeBrandResults.length} posizioni, nei reparti ${activeBrandAreas.map((area) => area.name).join(", ")}.`
                      : `Trovi ${activeBrand.name} nel reparto ${activeBrandArea.name}.`}
                  </p>
                  <div className="position-hint">
                    <span aria-hidden="true">⌖</span>
                    <span>
                      {activeBrandResults.length > 1
                        ? "Tutti i segnaposti trovati sono evidenziati e inquadrati insieme."
                        : "Il segnaposto è evidenziato e centrato sulla planimetria."}
                    </span>
                  </div>
                  <button className="reset-link" type="button" onClick={clearSearch}>Nuova ricerca</button>
                </article>
              ) : activeArea ? (
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

              <p className="prototype-note">Sono già disponibili {publishedBrands.length} segnaposto. Gli altri verranno aggiunti progressivamente.</p>
            </>
          )}
        </aside>

        <section className="map-panel" aria-label="Planimetria interattiva dello showroom">
          <div className="map-tools" aria-label="Controlli di ingrandimento">
            <button type="button" onClick={() => setZoom((value) => Math.min(2, value + 0.25))} aria-label="Ingrandisci">+</button>
            <span>{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => setZoom((value) => Math.max(0.75, value - 0.25))} aria-label="Riduci">−</button>
          </div>

          <div className="map-viewport" ref={mapViewportRef}>
            <div className="map-canvas" ref={mapCanvasRef} style={{ width: `${zoom * 100}%` }}>
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

                {activeArea && !editorMode && !activeBrand ? (
                  <g className="active-marker" transform={`translate(${activeArea.marker.x} ${activeArea.marker.y})`} aria-hidden="true">
                    <circle className="marker-pulse" r="31" fill={activeArea.color} />
                    <circle className="marker-core" r="16" fill="#ffffff" stroke={activeArea.color} strokeWidth="8" />
                  </g>
                ) : null}

                {!editorMode ? activeBrandResults.map((marker) => {
                  const area = showroomAreas.find((item) => item.slug === marker.areaSlug);
                  const labelWidth = Math.max(110, marker.name.length * 14 + 34);
                  return (
                    <g
                      className="public-brand-marker is-active"
                      transform={`translate(${marker.x} ${marker.y})`}
                      key={marker.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Mostra ${marker.name}`}
                      onClick={() => selectBrand(marker.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") selectBrand(marker.id);
                      }}
                    >
                      <rect
                        className="public-result-block"
                        x="-53"
                        y="-53"
                        width="106"
                        height="106"
                        rx="22"
                        fill={area?.color ?? "#1e73be"}
                      />
                      <circle className="public-brand-pulse" r="43" fill={area?.color ?? "#1e73be"} />
                      <g className="public-brand-label">
                        <rect x={-labelWidth / 2} y={-68} width={labelWidth} height="36" rx="9" />
                        <text x="0" y="-44">{marker.name}</text>
                      </g>
                      <path className="public-brand-pin" d="M 0,-24 C -17,-24 -27,-13 -27,1 C -27,20 0,42 0,42 C 0,42 27,20 27,1 C 27,-13 17,-24 0,-24 Z" fill={area?.color ?? "#1e73be"} />
                      <circle className="public-brand-core" r="8" />
                    </g>
                  );
                }) : null}

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
                      <path className="brand-pin" d="M 0,-24 C -17,-24 -27,-13 -27,1 C -27,20 0,42 0,42 C 0,42 27,20 27,1 C 27,-13 17,-24 0,-24 Z" fill={area?.color ?? "#1e73be"} />
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
