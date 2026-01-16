"use client";

import React, { useMemo, useState } from "react";

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
  const [sortMode] = useState<"az">("az");

  /* ------------------ ORDEN ------------------ */
  const sortedRaw = useMemo(() => {
    const out: PlantillasData = {};
    for (const cat of RAW_CATS) {
      const items = [...(data[cat] ?? [])];
      items.sort((a, b) => a.title.localeCompare(b.title, "es"));
      out[cat] = items;
    }
    return out;
  }, [data]);

  /* ------------------ AGRUPACIÓN ------------------ */
  const grouped = useMemo(() => {
    const base = GROUPS.map((g) => ({
      ...g,
      items: g.raw.flatMap((rc) => sortedRaw[rc] ?? []),
    })).filter((g) => g.items.length > 0);

    if (!onlyGroup) return base;
    return base.filter((g) => g.key === onlyGroup);
  }, [sortedRaw, onlyGroup]);

  /* ------------------ TEXTOS SEO ------------------ */
  const seoTopText =
    onlyGroup === "GI" ? (
      <>
        <p>
          En <strong>guardería e infantil</strong>, la orla es mucho más que una foto de grupo: es un recuerdo emocional
          para las familias y una forma bonita de cerrar el curso.
        </p>
        <p>
          En Lucialco trabajo con <strong>plantillas de orlas infantiles</strong> pensadas específicamente para centros
          educativos, con estilos alegres, colores suaves y una composición clara que funciona bien tanto en impresión
          como en formato digital.
        </p>
        <p>
          Aquí no hay automatismos ni diseños genéricos: hay <strong>CH — Creatividad Humana</strong>. Cada orla se
          revisa, se ajusta y se cuida para que el resultado tenga sentido y coherencia con el centro.
        </p>
      </>
    ) : onlyGroup === "PS" ? (
      <>
        <p>
          En <strong>primaria y secundaria</strong>, la orla debe transmitir equilibrio: un diseño actual y atractivo,
          pero con orden, claridad y criterio.
        </p>
        <p>
          Las <strong>plantillas de orlas para primaria e institutos</strong> de Lucialco están pensadas para
          <strong> centros públicos, concertados y privados</strong>, cuidando la composición, la tipografía y el tono
          visual para que el resultado sea profesional y atemporal.
        </p>
        <p>
          Hoy casi todo se puede generar con IA. Aquí la diferencia está en la <strong>Creatividad Humana</strong>:
          criterio, experiencia y sensibilidad para que la orla represente bien al centro y al grupo.
        </p>
      </>
    ) : null;

  const seoBottomText =
    onlyGroup === "GI" ? (
      <>
        <p>
          Estas plantillas están pensadas para <strong>escuelas infantiles y colegios</strong>, adaptándose al estilo de
          cada centro y al número de alumnos por aula.
        </p>
        <p>
          Si ninguna plantilla encaja del todo, siempre puedes optar por un <strong>diseño a medida</strong>, manteniendo
          la misma filosofía: cercanía, detalle y un resultado cuidado.
        </p>
      </>
    ) : onlyGroup === "PS" ? (
      <>
        <p>
          Estas plantillas funcionan especialmente bien en <strong>colegios de primaria e institutos</strong>, tanto
          públicos como concertados o privados, donde es importante mantener una imagen coherente y profesional.
        </p>
        <p>
          Puedes partir de una plantilla existente o solicitar un <strong>diseño personalizado</strong>, trabajado con
          tiempo, criterio y creatividad humana, sin soluciones automáticas.
        </p>
      </>
    ) : null;

  /* ------------------ RENDER ------------------ */
  return (
    <div>
      <h1>
        {onlyGroup === "GI"
          ? "Plantillas de orlas infantiles"
          : onlyGroup === "PS"
          ? "Plantillas de orlas para primaria y secundaria"
          : "Plantillas de orlas"}
      </h1>

      {/* TEXTO SEO SUPERIOR */}
      {seoTopText && <div style={{ marginTop: 14, lineHeight: 1.6 }}>{seoTopText}</div>}

      {/* GRID */}
      {grouped.map((g) => (
        <section key={g.key} style={{ marginTop: 32 }}>
          <h2>{g.label}</h2>

          <div style={grid}>
            {g.items.map((p) => (
              <div key={p.src} style={card}>
                <img src={p.src} alt={p.title} style={img} />
                <div style={{ fontWeight: 700, marginTop: 8 }}>{p.title}</div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* TEXTO SEO INFERIOR */}
      {seoBottomText && <div style={{ marginTop: 32, lineHeight: 1.6 }}>{seoBottomText}</div>}
    </div>
  );
}

/* ------------------ ESTILOS ------------------ */
const grid: React.CSSProperties = {
  marginTop: 16,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: 14,
};

const card: React.CSSProperties = {
  border: "1px solid #e6e6e6",
  borderRadius: 14,
  padding: 12,
  background: "white",
};

const img: React.CSSProperties = {
  width: "100%",
  height: 160,
  objectFit: "cover",
  borderRadius: 10,
};
