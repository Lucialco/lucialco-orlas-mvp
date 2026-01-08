"use client";

import { useMemo, useState } from "react";

type Plantilla = { src: string; title: string };
type PlantillasData = Record<string, Plantilla[]>;

// Categorías originales del JSON
const RAW_CATS = ["Guarderia", "Infantil", "Primaria", "Secundaria", "Bachillerato"] as const;

// Grupos nuevos (los que verá el usuario)
type GroupKey = "GI" | "PS";
type Group = { key: GroupKey; label: string; raw: (typeof RAW_CATS)[number][] };

const GROUPS: Group[] = [
  { key: "GI", label: "Guardería / Infantil", raw: ["Guarderia", "Infantil"] },
  { key: "PS", label: "Primaria / Secundaria", raw: ["Primaria", "Secundaria", "Bachillerato"] },
];

export default function PlantillasClient({ data }: { data: PlantillasData }) {
  const [openSrc, setOpenSrc] = useState<string | null>(null);
  const [openTitle, setOpenTitle] = useState<string>("");
  const [openGroup, setOpenGroup] = useState<GroupKey | null>(null);

  const [sortMode, setSortMode] = useState<"prefijo" | "az" | "za">("prefijo");

  // 1) Ordenamos cada categoría raw (como antes)
  const sortedRaw = useMemo(() => {
    const out: PlantillasData = {};
    for (const cat of RAW_CATS) {
      const items = [...(data[cat] ?? [])];

      items.sort((a, b) => {
        const an = extractPrefixNumber(a.src);
        const bn = extractPrefixNumber(b.src);

        if (sortMode === "prefijo") {
          if (an != null && bn != null) return an - bn;
          if (an != null && bn == null) return -1;
          if (an == null && bn != null) return 1;
          return a.title.localeCompare(b.title, "es");
        }
        if (sortMode === "az") return a.title.localeCompare(b.title, "es");
        return b.title.localeCompare(a.title, "es");
      });

      out[cat] = items;
    }
    return out;
  }, [data, sortMode]);

  // 2) Construimos los grupos unificados
  const grouped = useMemo(() => {
    return GROUPS.map((g) => {
      const items = g.raw.flatMap((rc) => sortedRaw[rc] ?? []);
      return { ...g, items };
    }).filter((g) => g.items.length > 0); // no mostramos grupos vacíos
  }, [sortedRaw]);

  return (
    <div>
      <div className="badge">Plantillas · Elige una base o pide diseño exclusivo</div>

      <h1 style={{ margin: "14px 0 0" }}>Plantillas de orlas</h1>
      <p style={{ color: "var(--muted)", lineHeight: 1.5, marginTop: 8 }}>
        Elige una plantilla como base o pide diseño a medida.
      </p>

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a href="/presupuesto?tipo=adhoc" className="btnPrimary">
          Quiero diseño a medida
        </a>

        <a href="/presupuesto" className="btnOutline">
          Pedir presupuesto sin elegir ahora
        </a>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontWeight: 900 }}>Orden:</div>

        <button
          onClick={() => setSortMode("prefijo")}
          className={sortMode === "prefijo" ? "pillOn" : "pill"}
          type="button"
        >
          Prefijo 01_, 02_…
        </button>
        <button onClick={() => setSortMode("az")} className={sortMode === "az" ? "pillOn" : "pill"} type="button">
          A–Z
        </button>
        <button onClick={() => setSortMode("za")} className={sortMode === "za" ? "pillOn" : "pill"} type="button">
          Z–A
        </button>
      </div>

      {/* Chips de navegación (solo 2 grupos) */}
      <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {grouped.map((g) => (
          <a key={g.key} href={`#${g.key}`} className="chip">
            {g.label}
          </a>
        ))}
      </div>

      {/* Secciones por grupo */}
      {grouped.map((g) => {
        const items = g.items;

        return (
          <section key={g.key} id={g.key} style={{ marginTop: 34 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0 }}>{g.label}</h2>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>{items.length} plantilla(s)</div>
            </div>

            <div style={grid}>
              {items.map((p) => (
                <div
                  key={p.src}
                  style={card}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 10px 22px rgba(0,0,0,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 rgba(0,0,0,0)";
                  }}
                >
                  <button
                    onClick={() => {
                      setOpenSrc(p.src);
                      setOpenTitle(p.title);
                      setOpenGroup(g.key);
                    }}
                    style={imgBtn}
                    aria-label={`Ver ${p.title}`}
                    type="button"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.src} alt={p.title} style={img} loading="lazy" />
                  </button>

                  <div style={{ marginTop: 10, fontWeight: 900, color: "var(--text)" }}>{p.title}</div>

                  <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a
                      href={`/presupuesto?tipo=plantilla&tpl=${encodeURIComponent(p.src)}&cat=${encodeURIComponent(g.label)}`}
                      className="btnPrimary"
                    >
                      Elegir esta
                    </a>

                    <a href={p.src} target="_blank" rel="noreferrer" className="btnLink" style={{ alignSelf: "center" }}>
                      Ver en pestaña
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* LIGHTBOX */}
      {openSrc && (
        <div onClick={() => setOpenSrc(null)} style={overlay} role="dialog" aria-modal="true">
          <div onClick={(e) => e.stopPropagation()} style={modal}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 900 }}>{openTitle}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{groupLabel(openGroup)}</div>
              </div>

              <button onClick={() => setOpenSrc(null)} style={closeBtn} aria-label="Cerrar" type="button">
                ✕
              </button>
            </div>

            <div style={{ marginTop: 12, borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={openSrc} alt={openTitle} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href={`/presupuesto?tipo=plantilla&tpl=${encodeURIComponent(openSrc)}&cat=${encodeURIComponent(groupLabel(openGroup))}`}
                className="btnPrimary"
              >
                Elegir esta plantilla
              </a>

              <a href={openSrc} target="_blank" rel="noreferrer" className="btnOutline">
                Abrir en pestaña
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function groupLabel(k: GroupKey | null) {
  if (k === "GI") return "Guardería / Infantil";
  if (k === "PS") return "Primaria / Secundaria";
  return "";
}

function extractPrefixNumber(src: string) {
  const name = decodeURIComponent(src.split("/").pop() || "");
  const m = name.match(/^(\d{1,3})[_-]/);
  if (!m) return null;
  return parseInt(m[1], 10);
}

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
  transition: "transform 120ms ease, box-shadow 120ms ease",
  boxShadow: "0 0 0 rgba(0,0,0,0)",
};

const imgBtn: React.CSSProperties = {
  padding: 0,
  margin: 0,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  width: "100%",
  textAlign: "left",
};

const img: React.CSSProperties = {
  width: "100%",
  height: 170,
  objectFit: "cover",
  display: "block",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--brand-soft)",
};

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 1000,
};

const modal: React.CSSProperties = {
  width: "min(980px, 100%)",
  background: "white",
  borderRadius: 18,
  padding: 14,
  border: "1px solid var(--border)",
};

const closeBtn: React.CSSProperties = {
  border: "1px solid var(--border)",
  background: "white",
  borderRadius: 12,
  padding: "8px 10px",
  cursor: "pointer",
  fontWeight: 900,
};

