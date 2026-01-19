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

  // CABECERA + CTA
  const header = (
    <>
      <div className="badge">Plantillas · Elige una categoría</div>

      <h1 style={{ marginTop: 14 }}>{group ? `Plantillas ${group.label}` : "Plantillas de orlas"}</h1>

      <p style={{ marginTop: 12, lineHeight: 1.6 }}>
        Aquí no te obligo a decidir a ciegas: primero eliges <b>la etapa</b> y luego ves las plantillas.
      </p>
      <p style={{ lineHeight: 1.6 }}>
        Si lo tienes claro desde ya, también puedes pedir <b>diseño exclusivo</b> (Lucía crea una orla única con vuestra temática).
      </p>

      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/presupuesto" className="btnPrimary">
          Solicitar presupuesto
        </Link>
        <Link href="/presupuesto?tipo=adhoc" className="btnOutline">
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

  // ---- CASO 1: página /plantillas -> selector de etapas
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

                  <Link href="/presupuesto" className="btnOutline" style={{ textDecoration: "none" }}>
                    Pedir presupuesto sin elegir ahora
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ marginTop: 22, color: "var(--muted)", lineHeight: 1.6 }}>
          <b>Tip:</b> si dudas entre plantilla y exclusivo, entra a{" "}
          <Link href="/presupuesto" style={{ fontWeight: 900, color: "var(--brand-hover)" }}>
            presupuesto
          </Link>{" "}
          y verás ambas opciones con precio por alumno y qué incluye cada una.
        </div>
      </div>
    );
  }

  // ---- CASO 2: páginas /plantillas-infantil y /plantillas-primaria-secundaria -> GRID
  return (
    <div>
      {header}

      <section style={{ marginTop: 22 }}>
        <h2 style={{ marginBottom: 10 }}>
          {items.length} plantillas · {group.label}
        </h2>

        <div style={grid}>
          {items.map((p, idx) => (
            <button
              key={`${p.src}-${idx}`}
              type="button"
              onClick={() => setOpen(p)}
              style={tile}
              aria-label={`Ver ${p.title}`}
            >
              <img
                src={p.src}
                alt={p.title}
                loading="lazy"
                style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 12, background: "#f3f3f3" }}
              />
              <div style={{ marginTop: 10, fontWeight: 800, fontSize: 14, textAlign: "left" }}>{p.title}</div>
            </button>
          ))}
        </div>
      </section>

      <div style={{ marginTop: 22, color: "var(--muted)", lineHeight: 1.6 }}>
        <b>Tip:</b> cuando elijas una, solicita{" "}
        <Link href="/presupuesto" style={{ fontWeight: 900, color: "var(--brand-hover)" }}>
          presupuesto
        </Link>{" "}
        y lo dejamos cerrado.
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
              <Link href="/presupuesto" className="btnPrimary">
                Solicitar presupuesto con esta plantilla
              </Link>
              <Link href="/presupuesto?tipo=adhoc" className="btnOutline">
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

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 12,
};

const tile: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 12,
  background: "white",
  cursor: "pointer",
  textAlign: "left",
};
