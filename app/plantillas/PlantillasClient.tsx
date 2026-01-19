"use client";

import React, { useMemo } from "react";

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

  const visibleGroups = onlyGroup ? GROUPS.filter((g) => g.key === onlyGroup) : GROUPS;

  return (
    <div>
      <div className="badge">Plantillas · Elige una categoría</div>

      <h1 style={{ marginTop: 14 }}>Plantillas de orlas</h1>

      <p style={{ marginTop: 12, lineHeight: 1.6 }}>
        Aquí no te obligo a decidir a ciegas: primero eliges <b>la etapa</b> y luego ves las plantillas.
      </p>
      <p style={{ lineHeight: 1.6 }}>
        Si lo tienes claro desde ya, también puedes pedir <b>diseño exclusivo</b> (Lucía crea una orla única con vuestra temática).
      </p>

      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a href="/presupuesto" className="btnPrimary">
          Solicitar presupuesto
        </a>
        <a href="/presupuesto?tipo=adhoc" className="btnOutline">
          Quiero diseño a medida
        </a>
      </div>

      <section style={{ marginTop: 22 }}>
        <h2 style={{ marginBottom: 10 }}>{onlyGroup ? "Plantillas" : "Elige una etapa"}</h2>

        <div style={catsGrid}>
          {visibleGroups.map((g) => (
            <div key={g.key} style={catCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <div style={{ fontWeight: 900, fontSize: 16 }}>{g.label}</div>
                <div style={{ fontWeight: 900, color: "var(--brand-hover)" }}>
                  {counts[g.key]} plantillas
                </div>
              </div>

              <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.5 }}>{g.subtitle}</div>

              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href={g.href} className="btnPrimary" style={{ textDecoration: "none" }}>
                  Ver plantillas de {g.label}
                </a>

                <a href="/presupuesto" className="btnOutline" style={{ textDecoration: "none" }}>
                  Pedir presupuesto sin elegir ahora
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ marginTop: 22, color: "var(--muted)", lineHeight: 1.6 }}>
        <b>Tip:</b> si dudas entre plantilla y exclusivo, entra a{" "}
        <a href="/presupuesto" style={{ fontWeight: 900, color: "var(--brand-hover)" }}>
          presupuesto
        </a>{" "}
        y verás ambas opciones con precio por alumno y qué incluye cada una.
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
};
