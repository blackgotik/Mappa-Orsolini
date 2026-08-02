"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import { showroomAreas } from "@/data/areas";

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

  const activeArea = showroomAreas.find((area) => area.slug === activeSlug) ?? null;
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
        <span className="prototype-badge">Mappa interattiva</span>
      </header>

      <section className="workspace">
        <aside className="search-panel">
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
              {query && (
                <button className="clear-button" type="button" onClick={clearSearch} aria-label="Cancella ricerca">
                  ×
                </button>
              )}
            </form>

            {query && !activeArea && (
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
            )}
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

              <svg className="interaction-layer" viewBox="0 0 1122.6667 1588" role="img" aria-label="Aree cliccabili della planimetria">
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
                  const isActive = area.slug === activeSlug;
                  return (
                    <g
                      className={`map-area${isActive ? " is-active" : ""}${activeSlug && !isActive ? " is-muted" : ""}`}
                      key={area.slug}
                      role="button"
                      tabIndex={0}
                      aria-label={`Apri il reparto ${area.name}`}
                      onClick={() => selectArea(area.slug)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") selectArea(area.slug);
                      }}
                    >
                      {area.paths.map((path, index) => (
                        <path key={`${area.slug}-${index}`} d={path} fill={area.color} />
                      ))}
                    </g>
                  );
                })}

                {activeArea && (
                  <g className="active-marker" transform={`translate(${activeArea.marker.x} ${activeArea.marker.y})`} aria-hidden="true">
                    <circle className="marker-pulse" r="31" fill={activeArea.color} />
                    <circle className="marker-core" r="16" fill="#ffffff" stroke={activeArea.color} strokeWidth="8" />
                  </g>
                )}

                <g className="entrance-marker" transform="translate(566 1545)" aria-hidden="true">
                  <path d="M 0 22 V -8 M -12 4 L 0 -10 L 12 4" />
                  <text x="0" y="42">INGRESSO</text>
                </g>
              </svg>
            </div>
          </div>

          <p className="map-help">Tocca direttamente un’area colorata oppure usa la ricerca.</p>
        </section>
      </section>
    </main>
  );
}
