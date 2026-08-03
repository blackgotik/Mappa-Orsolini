import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { showroomAreas } from "@/data/areas";
import { publishedBrands } from "@/data/brands";

type HomeProps = {
  searchParams: Promise<{ editor?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { editor } = await searchParams;
  if (editor === "1") redirect("/mappa?editor=1");

  const brandCount = new Set(
    publishedBrands.map((brand) => brand.name.trim().toLocaleLowerCase("it")),
  ).size;

  return (
    <main className="welcome-page">
      <div className="welcome-glow welcome-glow-one" aria-hidden="true" />
      <div className="welcome-glow welcome-glow-two" aria-hidden="true" />

      <header className="welcome-header">
        <div className="welcome-logo-wrap">
          <Image
            src="/logo-orsolini.png"
            width={210}
            height={52}
            alt="Orsolini — Dal 1880 Cultura della Casa"
            priority
          />
        </div>
        <span className="welcome-location">Showroom Pomezia</span>
      </header>

      <section className="welcome-hero">
        <div className="welcome-copy">
          <p className="welcome-eyebrow"><span aria-hidden="true" /> Benvenuti nel nostro showroom</p>
          <h1>La tua casa<br /><em>comincia da qui.</em></h1>
          <p className="welcome-intro">
            Esplora ambienti, materiali e soluzioni. Trova in pochi secondi il reparto
            o il marchio che stai cercando e lasciati guidare nel nostro showroom.
          </p>

          <div className="welcome-actions">
            <Link className="welcome-primary" href="/mappa">
              <span>Esplora lo showroom</span>
              <span aria-hidden="true">→</span>
            </Link>
            <p>Nessuna app da installare. Tocca e inizia l&apos;esplorazione.</p>
          </div>

          <div className="welcome-stats" aria-label="Contenuti della mappa">
            <div><strong>{showroomAreas.length}</strong><span>reparti</span></div>
            <div><strong>{brandCount}</strong><span>marchi</span></div>
            <div><strong>1</strong><span>mappa interattiva</span></div>
          </div>
        </div>

        <div className="welcome-visual" aria-hidden="true">
          <div className="welcome-map-shadow" />
          <div className="welcome-map-card">
            <div className="welcome-map-topline">
              <span>Orientati nello showroom</span>
              <span>MAPPA 01</span>
            </div>
            <div className="welcome-map-preview">
              <Image
                src="/planimetria-orsolini.svg"
                alt=""
                fill
                priority
                unoptimized
                sizes="(max-width: 860px) 72vw, 38vw"
              />
              <span className="welcome-pin pin-one"><i /></span>
              <span className="welcome-pin pin-two"><i /></span>
              <span className="welcome-pin pin-three"><i /></span>
            </div>
            <div className="welcome-map-caption">
              <span className="welcome-pulse" />
              <div><strong>Cerca. Trova. Esplora.</strong><small>Il tuo percorso inizia qui</small></div>
            </div>
          </div>
        </div>
      </section>

      <footer className="welcome-footer">
        <span>Orsolini · Dal 1880 Cultura della Casa</span>
        <span>Showroom Pomezia</span>
      </footer>
    </main>
  );
}
