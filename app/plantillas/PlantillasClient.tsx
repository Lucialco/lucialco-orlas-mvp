"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Plantilla = { src: string; title: string };
type PlantillasData = Record<string, Plantilla[]>;

const RAW_CATS = ["Guarderia", "Infantil", "Primaria", "Secundaria", "Bachillerato"] as const;

type GroupKey = "GI" | "PS";
type Group = {
  key: GroupKey;
  label: string;
  raw: (typeof RAW_CATS)[number][];
  href: string;
  subtitle: string;
};

const GROUPS: Group[] = [
  {
    key: "GI",
    label: "Guardería / Infantil",
    raw: ["Guarderia", "Infantil"],
    href: "/plantillas-infantil",
    subtitle: "Estilos alegres y dulces, pensados para los más peques.",
  },
  {
    key: "PS",
    label: "Primaria / Secundaria",
    raw: ["Primaria", "Secundaria"],
    href: "/plantillas-primaria-secundaria",
    subtitle: "Diseños más sobrios y actuales, con buena legibilidad.",
  },
];

export default function PlantillasClient({
  data,
  onlyGroup,
}: {
  data: PlantillasData;
  onlyGroup?: GroupKey;
}) {
  const counts = useMemo(() => {
    const byKey: Record<GroupKey, number> = { GI: 0, PS: 0 };
    for (const g of GROUPS) {
      byKey[g.key] = g.raw.reduce((acc, rc) => acc + ((data as any)[rc]?.length ?? 0), 0);
    }
    return byKey;
  }, [data]);

  const group = onlyGroup ? GROUPS.find((g) => g.key === onlyGroup) : null;

  const items: Plantilla[] = useMemo(() => {
    if (!group) return [];
    const out: Plantilla[] = [];
    for (const rc of group.raw) out.push(...(((data as any)[rc] as Plantilla[]) ?? []));
    return out;
  }, [data, group]);

  const [open, setOpen] = useState<Plantilla | null>(null);

  // RUTAS “SIN BUCLES”
  const presupuestoPlantilla = "/presupuesto?tipo=plantilla";
  const presupuestoExclusivo = "/presupuesto?tipo=adhoc";

  const header = (
    <>
      <div className="badge">Plantillas · Elige una categoría</div>

      <h1 style={{ marginTop: 14 }}>{group ? `Plantillas ${group.label}` : "Plantillas de orlas"}</h1>

      <p style={{ marginTop: 12, lineHeight: 1.6 }}>
        Primero eliges <b>la etapa</b> y luego ves las plantillas.
      </p>
      <p style={{ lineHeight: 1.6 }}>
        Si lo tienes claro desde ya, también puedes pedir <b>diseño exclusivo</b> (Lucía crea una orla única con vuestra temática).
      </p>

      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href={presupuestoPlantilla} className="btnPrimary">
          Solicitar presupuesto
        </Link>
        <Link href={presupuestoExclusivo} className="btnOutline">
          Quiero diseño a medida
        </Link>
        {group ? (
          <Link href="/plantillas" className="btnOutline">
            Volver a etapas
          </Link>
        ) : null}
      </div>
    </>
  );

  // /plantillas => selector
  if (!group) {
    return (
      <div>
        {header}

        <section style={{ marginTop: 22 }}>
          <h2 style={{ marginBottom: 10 }}>Elige una etapa</h2>

          <div style={catsGrid}>
            {GROUPS.map((g) => (
              <div key={g.key} style={catCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>{g.label}</div>
                  <div style={{ fontWeight: 900, color: "var(--brand-hover)" }}>{counts[g.key]} plantillas</div>
                </div>

                <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.5 }}>{g.subtitle}</div>

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link href={g.href} className="btnPrimary" style={{ textDecoration: "none" }}>
                    Ver plantillas de {g.label}
                  </Link>

                  <Link href={presupuestoExclusivo} className="btnOutline" style={{ textDecoration: "none" }}>
                    Prefiero diseño exclusivo
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ marginTop: 22, color: "var(--muted)", lineHeight: 1.6 }}>
          <b>Tip:</b> si no te encaja ninguna plantilla, te vas a{" "}
          <Link href={presupuestoExclusivo} style={{ fontWeight: 900, color: "var(--brand-hover)" }}>
            diseño exclusivo
          </Link>{" "}
          y lo hacemos a medida.
        </div>
      </div>
    );
  }

  // ====== CARRUSEL CON FLECHAS ======
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const refreshArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft < max - 2);
  };

  useEffect(() => {
    refreshArrows();
    const el = trackRef.current;
    if (!el) return;

    const onScroll = () => refreshArrows();
    const onResize = () => refreshArrows();

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll as any);
      window.removeEventListener("resize", onResize);
    };
  }, [items.length]);

  const scrollByCards = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.max(280, Math.floor(el.clientWidth * 0.85));
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  // /plantillas-infantil | /plantillas-primaria-secundaria
  return (
    <div>
      {header}

      <section style={{ marginTop: 22 }}>
        <h2 style={{ marginBottom: 10 }}>
          {items.length} plantillas · {group.label}
        </h2>

        {/* Carrusel */}
        <div style={carouselShell}>
          <div style={carouselTopBar}>
            <button
              type="button"
              className="btnOutline"
              onClick={() => scrollByCards(-1)}
              disabled={!canLeft}
              style={{ opacity: canLeft ? 1 : 0.4 }}
            >
              ←
            </button>

            <div style={{ color: "var(--muted)", fontWeight: 800, fontSize: 13 }}>
              Desliza o usa las flechas
            </div>

            <button
              type="button"
              className="btnOutline"
              onClick={() => scrollByCards(1)}
              disabled={!canRight}
              style={{ opacity: canRight ? 1 : 0.4 }}
            >
              →
            </button>
          </div>

          <div ref={trackRef} style={carousel} aria-label="Carrusel de plantillas">
            {items.map((p, idx) => (
              <button
                key={`${p.src}-${idx}`}
                type="button"
                onClick={() => setOpen(p)}
                style={slide}
                aria-label={`Ver ${p.title}`}
              >
                <img
                  src={p.src}
                  alt={p.title}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: 260,
                    objectFit: "cover",
                    borderRadius: 14,
                    background: "#f3f3f3",
                  }}
                />
                <div style={{ marginTop: 10, fontWeight: 900, fontSize: 14, textAlign: "left" }}>{p.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Dos bloques iguales (mismo look que selector) */}
        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 14,
          }}
        >
          <div style={infoCard}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Cómo funciona</div>

            <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, color: "var(--muted)" }}>
              <li>Elige una plantilla del carrusel.</li>
              <li>Pulsa “Elegir esta plantilla” y rellena el presupuesto.</li>
              <li>Adaptamos nombres, logos, composición y te enviamos el presupuesto final.</li>
            </ol>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href={presupuestoPlantilla} className="btnOutline">
                Ir a presupuesto
              </Link>
              <Link href={presupuestoExclusivo} className="btnOutline">
                Prefiero exclusivo
              </Link>
            </div>
          </div>

          <div style={infoCard}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Extras opcionales</div>

            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, color: "var(--muted)" }}>
              <li>
                <b>Beca</b> (banda/beca para alumnos y/o profesores)
              </li>
              <li>
                <b>Fotos de recuerdo</b> (pack por alumno)
              </li>
              <li>
                <b>Taza</b> personalizada
              </li>
              <li>
                <b>Sobre reforzado</b> con nombre
              </li>
            </ul>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href={presupuestoPlantilla} className="btnPrimary">
                Pedir presupuesto
              </Link>
              <Link href={presupuestoExclusivo} className="btnOutline">
                Quiero diseño exclusivo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div style={{ marginTop: 22, color: "var(--muted)", lineHeight: 1.6 }}>
        <b>Tip:</b> abre una plantilla, mírala grande, y elige la que más encaje. Cero dramas, cero laberintos.
      </div>

      {/* Lightbox */}
      {open ? (
        <div
          onClick={() => setOpen(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(980px, 96vw)",
              background: "white",
              borderRadius: 16,
              padding: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div style={{ fontWeight: 900 }}>{open.title}</div>
              <button type="button" className="btnOutline" onClick={() => setOpen(null)}>
                Cerrar
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              <img
                src={open.src}
                alt={open.title}
                style={{
                  width: "100%",
                  maxHeight: "78vh",
                  objectFit: "contain",
                  borderRadius: 12,
                  background: "#f3f3f3",
                }}
              />
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link
                href={`/presupuesto?tipo=plantilla&plantilla_url=${encodeURIComponent(open.src)}&categoria_plantilla=${encodeURIComponent(
                  group.label
                )}`}
                className="btnPrimary"
              >
                Elegir esta plantilla para el presupuesto
              </Link>

              <Link href={presupuestoExclusivo} className="btnOutline">
                Prefiero diseño exclusivo
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const catsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 12,
};

const catCard: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 14,
  background: "white",
};

const carouselShell: React.CSSProperties = {
  borderRadius: 18,
};

const carouselTopBar: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginBottom: 10,
};

const carousel: React.CSSProperties = {
  display: "flex",
  gap: 12,
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  paddingBottom: 10,
  paddingTop: 4,
  WebkitOverflowScrolling: "touch",
};

const slide: React.CSSProperties = {
  minWidth: 260,
  maxWidth: 260,
  flex: "0 0 auto",
  border: "1px solid var(--border)",
  borderRadius: 18,
  padding: 12,
  background: "white",
  cursor: "pointer",
  textAlign: "left",
  scrollSnapAlign: "start",
};

const infoCard: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 14,
  background: "white",
};

