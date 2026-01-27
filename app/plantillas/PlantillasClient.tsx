// app/plantillas/PlantillasClient.tsx
"use client";

import React, { useMemo, useState } from "react";
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

// ✅ Extras con IMAGEN desde /public (las tienes en /public directamente)
const EXTRAS = [
  {
    key: "beca",
    title: "Beca (banda)",
    subtitle: "Para alumnos y/o profes",
    desc: "Banda personalizada con el nombre del cole/grupo. Queda brutal en la foto final.",
    img: "/extra-beca.webp",
  },
  {
    key: "recuerdo",
    title: "Fotos de recuerdo",
    subtitle: "Pack por alumno",
    desc: "Fotos individuales para las familias. Se calcula por alumno.",
    img: "/extra-fotos.webp",
  },
  {
    key: "taza",
    title: "Taza personalizada",
    subtitle: "Con foto / nombre",
    desc: "Un detalle perfecto para regalar. Personalizada con foto y nombre.",
    img: "/extra-taza.webp",
  },
];

function presupuestoWithTpl(open: Plantilla, groupLabel: string) {
  return `/presupuesto?tpl=${encodeURIComponent(open.src)}&cat=${encodeURIComponent(groupLabel)}`;
}

type ExtraItem = (typeof EXTRAS)[number];

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
  const [openExtra, setOpenExtra] = useState<ExtraItem | null>(null);

  // ✅ NUEVO FLUJO: presupuesto decide por provincia, aquí no forzamos tipo
  const presupuestoBase = "/presupuesto";
  const presupuestoExclusivo = "/presupuesto?tipo=adhoc";

  const header = (
    <>
      <div className="badge">Plantillas · Elige una categoría</div>

      <h1 style={{ marginTop: 14 }}>{group ? `Plantillas ${group.label}` : "Plantillas de orlas"}</h1>

      <p style={{ marginTop: 12, lineHeight: 1.6 }}>
        Aquí no te obligo a decidir a ciegas: primero eliges <b>la etapa</b> y luego ves las plantillas.
      </p>
      <p style={{ lineHeight: 1.6 }}>
        Si lo tienes claro desde ya, también puedes pedir <b>diseño exclusivo</b> (Lucía crea una orla única con vuestra
        temática).
      </p>

      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href={presupuestoBase} className="btnPrimary">
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

                  <Link href={presupuestoBase} className="btnOutline" style={{ textDecoration: "none" }}>
                    Pedir presupuesto sin elegir ahora
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ marginTop: 22, color: "var(--muted)", lineHeight: 1.6 }}>
          <b>Tip:</b> entra a{" "}
          <Link href={presupuestoBase} style={{ fontWeight: 900, color: "var(--brand-hover)" }}>
            presupuesto
          </Link>{" "}
          y allí eliges provincia y la modalidad (presencial o digital).
        </div>
      </div>
    );
  }

  // /plantillas-infantil | /plantillas-primaria-secundaria
  return (
    <div>
      {header}

      <section style={{ marginTop: 22 }}>
        <h2 style={{ marginBottom: 10 }}>
          {items.length} plantillas · {group.label}
        </h2>

        <div style={carouselWrap}>
          <div style={carousel} aria-label="Carrusel de plantillas">
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

        {/* Bloques debajo del carrusel */}
        <div style={twoCols}>
          {/* Cómo funciona */}
          <div className="card">
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Cómo funciona</div>

            <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.75, color: "var(--muted)" }}>
              <li>Elige una plantilla del carrusel.</li>
              <li>Pulsa “Elegir esta plantilla” y rellena el presupuesto.</li>
              <li>En presupuesto seleccionas provincia y modalidad (presencial o digital).</li>
              <li>Adaptamos nombres, logos y composición y te enviamos el presupuesto final.</li>
            </ol>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href={presupuestoExclusivo} className="btnOutline" style={{ textDecoration: "none" }}>
                Prefiero diseño exclusivo
              </Link>

              <Link href={presupuestoBase} className="btnOutline" style={{ textDecoration: "none" }}>
                Ir a presupuesto
              </Link>
            </div>
          </div>

          {/* ✅ Extras opcionales con imagen + click para ampliar */}
          <div className="card">
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Extras opcionales</div>

            <div style={extrasCarousel} aria-label="Carrusel de extras">
              {EXTRAS.map((x) => (
                <button
                  key={x.key}
                  type="button"
                  onClick={() => setOpenExtra(x)}
                  style={extraSlideBtn}
                  aria-label={`Ver ${x.title}`}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 120,
                      borderRadius: 14,
                      overflow: "hidden",
                      border: "1px solid var(--border)",
                      background: "white",
                    }}
                  >
                    <img
                      src={x.img}
                      alt={x.title}
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      onError={(e) => {
                        // fallback limpio si alguna imagen no carga
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>

                  <div style={{ fontWeight: 900, marginTop: 10, textAlign: "left" }}>{x.title}</div>
                  <div style={{ color: "var(--muted)", marginTop: 6, lineHeight: 1.45, fontSize: 13, textAlign: "left" }}>
                    {x.subtitle}
                  </div>
                </button>
              ))}
            </div>

            <div style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.6 }}>
              Los extras se eligen en el formulario de presupuesto (así no te mareo aquí).
            </div>
          </div>
        </div>
      </section>

      <div style={{ marginTop: 18, color: "var(--muted)", lineHeight: 1.6 }}>
        <b>Tip:</b> abre una plantilla, mírala grande, y elige la que más encaje. Cero dramas, cero laberintos.
      </div>

      {/* Lightbox plantilla */}
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
              <Link href={presupuestoWithTpl(open, group.label)} className="btnPrimary">
                Elegir esta plantilla para el presupuesto
              </Link>

              <Link href={presupuestoExclusivo} className="btnOutline">
                Prefiero diseño exclusivo
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* ✅ Lightbox extra */}
      {openExtra ? (
        <div
          onClick={() => setOpenExtra(null)}
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
              width: "min(860px, 96vw)",
              background: "white",
              borderRadius: 16,
              padding: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div style={{ fontWeight: 900 }}>{openExtra.title}</div>
              <button type="button" className="btnOutline" onClick={() => setOpenExtra(null)}>
                Cerrar
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              <img
                src={openExtra.img}
                alt={openExtra.title}
                style={{
                  width: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  borderRadius: 12,
                  background: "#f3f3f3",
                }}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ color: "var(--muted)", lineHeight: 1.55 }}>{openExtra.desc}</div>
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

const carouselWrap: React.CSSProperties = {
  overflow: "hidden",
  borderRadius: 18,
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

const twoCols: React.CSSProperties = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 12,
  alignItems: "start",
};

const extrasCarousel: React.CSSProperties = {
  display: "flex",
  gap: 10,
  overflowX: "auto",
  paddingBottom: 6,
  WebkitOverflowScrolling: "touch",
  scrollSnapType: "x mandatory",
};

const extraSlideBtn: React.CSSProperties = {
  minWidth: 220,
  maxWidth: 220,
  flex: "0 0 auto",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 12,
  background: "white",
  scrollSnapAlign: "start",
  cursor: "pointer",
  textAlign: "left",
};
