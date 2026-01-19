"use client";

import React, { useMemo, useState } from "react";

type Plantilla = { src: string; title: string };
type PlantillasData = Record<string, Plantilla[]>;

// Categorías originales del JSON (las mantenemos por compatibilidad, aunque aquí no renderizamos el grid)
const RAW_CATS = ["Guarderia", "Infantil", "Primaria", "Secundaria", "Bachillerato"] as const;

// Grupos visibles
type GroupKey = "GI" | "PS";
type Group = { key: GroupKey; label: string; raw: (typeof RAW_CATS)[number][];

  // target page
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
  // Contadores por grupo (para mostrar “X plantillas”)
  const counts = useMemo(() => {
    const byKey: Record<GroupKey, number> = { GI: 0, PS: 0 };
    for (const g of GROUPS) {
      const n = g.raw.reduce((acc, rc) => acc + ((data as any)[rc]?.length ?? 0), 0);
      byKey[g.key] = n;
    }
    return byKey;
  }, [data]);

  // En /plantillas queremos SOLO selector de grupos.
  // Si en el futuro quisieras reutilizar este componente para páginas de grupo, lo haremos aparte (otro componente).
  const [selected, setSelected] = useState<GroupKey>("GI");

  // COPY superior
  const topCopy = (
    <>
      <p style={{ marginTop: 12, lineHeight: 1.6 }}>
        Aquí no te obligo a decidir a ciegas: primero eliges <b>la etapa</b> y luego ves las plantillas.
      </p>
      <p style={{ lineHeight: 1.6 }}>
        Si lo tienes claro desde ya, también puedes pedir <b>diseño exclusivo</b> (Lucía crea una orla única con vuestra temática).
      </p>
    </>
  );

  return (
    <div>
      <div className="badge">Plantillas · Elige una categoría</div>

      <h1 style={{ marginTop: 14 }}>Plantillas de orlas</h1>

      {topCopy}

      {/* CTA */}
      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a href="/presupuesto" className="btnPrimary">
          Solicitar presupuesto
        </a>
        <a href="/presupuesto?tipo=adhoc" className="btnOutline">
          Quiero diseño a medida
        </a>
      </div>

      {/* Selector de categorías (zoom) */}
      <section style={{ marginTop: 22 }}>
        <h2 style={{ marginBottom: 10 }}>Elige una etapa</h2>

        <div style={catsGrid}>
          {GROUPS.map((g) => {
            const active = selected === g.key;
            return (
              <button
                key={g.key}
                type="button"
                onClick={() => setSelected(g.key)}
                style={{
                  ...catCard,
                  ...(active ? catCardActive : {}),
                }}
                aria-pressed={active}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>{g.label}</div>
                  <div style={{ fontWeight: 900, color: "var(--brand-hover)" }}>{counts[g.key]} plantillas</div>
                </div>

                <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.5 }}>{g.subtitle}</div>

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a href={g.href} className={active ? "btnPrimary" : "btnOutline"} style={{ textDecoration: "none" }}>
                    Ver plantillas de {g.label}
                  </a>

                  <a href="/presupuesto" className="btnOutline" style={{ textDecoration: "none" }}>
                    Pedir presupuesto sin elegir ahora
                  </a>
                </div>
              </button>
            );
          })}
        </div>

        {/* Panel “seleccionado” (más grande) */}
        <div className="card" style={{ marginTop: 14, background: "var(--brand-soft)" }}>
          <div style={{ fontWeight: 900 }}>Seleccionado: {selected === "GI" ? "Guardería / Infantil" : "Primaria / Secundaria"}</div>
          <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
            Entra a ver las plantillas y, al clicar una, podrás verla grande y usarla para tu presupuesto.
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href={selected === "GI" ? "/plantillas-infantil" : "/plantillas-primaria-secundaria"} className="btnPrimary">
              Ver plantillas
            </a>
            <a href="/presupuesto?tipo=adhoc" className="btnOutline">
              Ir a diseño exclusivo
            </a>
          </div>
        </div>
      </section>

      {/* Nota final */}
      <div style={{ marginTop: 22, color: "var(--muted)", lineHeight: 1.6 }}>
        <b>Tip:</b> si dudas entre plantilla y exclusivo, entra a <a href="/presupuesto" style={{ fontWeight: 900, color: "var(--brand-hover)" }}>presupuesto</a> y
        verás ambas opciones con precio por alumno y qué incluye cada una.
      </div>
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
  textAlign: "left",
  cursor: "pointer",
  transition: "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease",
};

const catCardActive: React.CSSProperties = {
  border: "1px solid var(--brand)",
  boxShadow: "0 10px 26px rgba(0,0,0,0.08)",
  transform: "scale(1.01)",
};
