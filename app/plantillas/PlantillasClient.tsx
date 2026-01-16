"use client";

import { useMemo, useState } from "react";

type Plantilla = { src: string; title: string };
type PlantillasData = Record<string, Plantilla[]>;

// Categorías originales del JSON
const RAW_CATS = ["Guarderia", "Infantil", "Primaria", "Secundaria", "Bachillerato"] as const;

// Grupos visibles
type GroupKey = "GI" | "PS";
type Group = { key: GroupKey; label: string; raw: (typeof RAW_CATS)[number][] };

const GROUPS: Group[] = [
  { key: "GI", label: "Guardería / Infantil", raw: ["Guarderia", "Infantil"] },
  { key: "PS", label: "Primaria / Secundaria", raw: ["Primaria", "Secundaria"] },
];

export default function PlantillasClient({
  data,
  onlyGroup,
}: {
  data: PlantillasData;
  onlyGroup?: GroupKey;
}) {
  const [sortMode, setSortMode] = useState<"prefijo" | "az" | "za">("prefijo");

  /* ---------- ORDEN ---------- */
  const sortedRaw = useMemo(() => {
    const out: PlantillasData = {};
    for (const cat of RAW_CATS) {
      const items = [...(data[cat] ?? [])];

      items.sort((a, b) => {
        if (sortMode === "az") return a.title.localeCompare(b.title, "es");
        if (sortMode === "za") return b.title.localeCompare(a.title, "es");
        return a.title.localeCompare(b.title, "es");
      });

      out[cat] = items;
    }
    return out;
  }, [data, sortMode]);

  /* ---------- AGRUPACIÓN ---------- */
  const grouped = useMemo(() => {
    const base = GROUPS.map((g) => ({
      ...g,
      items: g.raw.flatMap((rc) => sortedRaw[rc] ?? []),
    })).filter((g) => g.items.length > 0);

    if (!onlyGroup) return base;
    return base.filter((g) => g.key === onlyGroup);
  }, [sortedRaw, onlyGroup]);

  /* ---------- COPY (VERSIÓN ANTERIOR) ---------- */
  const seoTopText =
    onlyGroup === "GI" ? (
      <>
        <p>
          En <strong>guardería e infantil</strong>, la orla es mucho más que una foto de grupo: es un recuerdo emocional
          para las familias y un cierre bonito para el curso.
        </p>
        <p>
          En Lucialco diseño <strong>plantillas de orlas infantiles</strong> pensadas para centros educativos: estilos
          alegres, colores suaves y una composición clara que funciona bien tanto en impresión como en formato digital.
        </p>
        <p>
          Me encargo de acompañarte en todo el proceso para que sea sencillo para el centro: recogida de fotos, ajustes
          finales y entrega lista para imprimir, sin complicaciones.
        </p>
      </>
    ) : onlyGroup === "PS" ? (
      <>
        <p>
          En <strong>primaria y secundaria</strong>, la orla necesita un equilibrio claro: un diseño actual y atractivo,
          pero sin perder sobriedad ni legibilidad.
        </p>
        <p>
          Las <strong>plantillas de orlas para primaria y secundaria</strong> de Lucialco están pensadas para reflejar el
          carácter del grupo y del centro, con composiciones limpias y tipografías claras.
        </p>
        <p>
          El proceso está diseñado para ahorrar tiempo al centro: centralizamos la gestión de fotos, revisamos juntos el
          resultado y entrego la orla final lista para imprimir.
        </p>
      </>
    ) : null;

  const seoBottomText =
    onlyGroup === "GI" ? (
      <>
        <p>
          Estas plantillas están pensadas especialmente para <strong>escuelas infantiles y colegios</strong>,
          adaptándose al estilo de cada centro y al número de alumnos por aula.
        </p>
        <p>
          Si ninguna plantilla encaja al 100 %, siempre puedes optar por un <strong>diseño a medida</strong>, manteniendo
          la misma filosofía: cuidado en el detalle, trato cercano y un resultado profesional.
        </p>
      </>
    ) : onlyGroup === "PS" ? (
      <>
        <p>
          Estas plantillas funcionan especialmente bien en <strong>colegios de primaria e institutos</strong>, donde es
          importante mantener una imagen cuidada y coherente con la etapa educativa.
        </p>
        <p>
          Puedes partir de una plantilla existente o solicitar un <strong>diseño personalizado</strong>, adaptado a la
          identidad del centro y a las necesidades concretas del curso.
        </p>
      </>
    ) : null;

  /* ---------- RENDER ---------- */
  return (
    <div>
      <div className="badge">Plantillas · Elige una base o pide diseño exclusivo</div>

      <h1 style={{ marginTop: 14 }}>
        {onlyGroup === "GI"
          ? "Plantillas de orlas infantiles"
          : onlyGroup === "PS"
          ? "Plantillas de orlas para primaria y secundaria"
          : "Plantillas de orlas"}
      </h1>

      {/* COPY SUPERIOR */}
      {seoTopText && <div style={{ marginTop: 12, lineHeight: 1.6 }}>{seoTopText}</div>}

      {/* CTA */}
      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a href="/presupuesto?tipo=adhoc" className="btnPrimary">
          Quiero diseño a medida
        </a>
        <a href="/presupuesto" className="btnOutline">
          Pedir presupuesto sin elegir ahora
        </a>
      </div>

      {/* CHIPS */}
      {!onlyGroup && (
        <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href="/plantillas-infantil" className="chip">
            Guardería / Infantil
          </a>
          <a href="/plantillas-primaria-secundaria" className="chip">
            Primaria / Secundaria
          </a>
        </div>
      )}

      {/* GRID */}
      {grouped.map((g) => (
        <section key={g.key} style={{ marginTop: 32 }}>
          <h2>{g.label}</h2>

          <div style={grid}>
            {g.items.map((p) => (
              <div key={p.src} style={card}>
                <img src={p.src} alt={p.title} style={img} />
                <div style={{ marginTop: 8, fontWeight: 700 }}>{p.title}</div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* COPY INFERIOR */}
      {seoBottomText && <div style={{ marginTop: 32, lineHeight: 1.6 }}>{seoBottomText}</div>}
    </div>
  );
}

/* ---------- ESTILOS ---------- */
const grid: React.CSSProperties = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
  gap: 14,
};

const card: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 14,
  background: "white",
};

const img: React.CSSProperties = {
  width: "100%",
  height: 170,
  objectFit: "cover",
  borderRadius: 12,
};
