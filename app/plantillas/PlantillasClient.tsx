"use client";

import { useMemo, useState } from "react";

type Plantilla = { src: string; title: string };
type PlantillasData = Record<string, Plantilla[]>;

const CATS = ["Guarderia", "Infantil", "Primaria", "Secundaria", "Bachillerato"] as const;

export default function PlantillasClient({ data }: { data: PlantillasData }) {
  const [openSrc, setOpenSrc] = useState<string | null>(null);
  const [openTitle, setOpenTitle] = useState<string>("");
  const [openCat, setOpenCat] = useState<string>("");

  const [sortMode, setSortMode] = useState<"prefijo" | "az" | "za">("prefijo");

  const sorted = useMemo(() => {
    const out: PlantillasData = {};
    for (const cat of CATS) {
      const items = [...(data[cat] ?? [])];

      // Orden 2: en runtime (por si no quieres tocar el script)
      items.sort((a, b) => {
        const an = extractPrefixNumber(a.src);
        const bn = extractPrefixNumber(b.src);

        if (sortMode === "prefijo") {
          // Si ambos tienen prefijo numérico -> por número
          if (an != null && bn != null) return an - bn;
          // Uno con prefijo y otro no -> el con prefijo primero
          if (an != null && bn == null) return -1;
          if (an == null && bn != null) return 1;
          // Si ninguno tiene prefijo -> alfabético por title
          return a.title.localeCompare(b.title, "es");
        }

        if (sortMode === "az") return a.title.localeCompare(b.title, "es");
        return b.title.localeCompare(a.title, "es");
      });

      out[cat] = items;
    }
    return out;
  }, [data, sortMode]);

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginTop: 10 }}>Plantillas de orlas</h1>
      <p style={{ color: "#444", lineHeight: 1.5, marginTop: 8 }}>
        Elige una plantilla como base o pide diseño a medida.
      </p>

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a href="/presupuesto?tipo=adhoc" style={ctaDark}>
          Quiero diseño a medida
        </a>
        <a href="/presupuesto" style={ctaOutline}>
          Pedir presupuesto sin elegir ahora
        </a>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontWeight: 900 }}>Orden:</div>
        <button onClick={() => setSortMode("prefijo")} style={sortMode === "prefijo" ? pillOn : pill}>
          Prefijo 01_, 02_…
        </button>
        <button onClick={() => setSortMode("az")} style={sortMode === "az" ? pillOn : pill}>
          A–Z
        </button>
        <button onClick={() => setSortMode("za")} style={sortMode === "za" ? pillOn : pill}>
          Z–A
        </button>
        <div style={{ color: "#666", fontSize: 13 }}>
          Consejo: renombra en Drive con <b>01_</b>, <b>02_</b>… para control total.
        </div>
      </div>

      <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {CATS.map((cat) => (
          <a key={cat} href={`#${cat}`} style={chip}>
            {labelCat(cat)}
          </a>
        ))}
      </div>

      {CATS.map((cat) => {
        const items = sorted[cat] ?? [];

        return (
          <section key={cat} id={cat} style={{ marginTop: 34 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0 }}>{labelCat(cat)}</h2>
              <div style={{ color: "#666", fontSize: 13 }}>{items.length} plantilla(s)</div>
            </div>

            {items.length === 0 ? (
              <div style={empty}>Aún no hay plantillas en esta categoría.</div>
            ) : (
              <div style={grid}>
                {items.map((p) => (
                  <div key={p.src} style={card}>
                    <button
                      onClick={() => {
                        setOpenSrc(p.src);
                        setOpenTitle(p.title);
                        setOpenCat(cat);
                      }}
                      style={imgBtn}
                      aria-label={`Ver ${p.title}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.src}
                        alt={p.title}
                        style={{
                          width: "100%",
                          height: 170,
                          objectFit: "cover",
                          display: "block",
                          borderRadius: 12,
                          border: "1px solid #eee",
                          background: "#fafafa",
                        }}
                        loading="lazy"
                      />
                    </button>

                    <div style={{ marginTop: 10, fontWeight: 900, color: "#111" }}>{p.title}</div>

                    <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <a
                        href={`/presupuesto?tipo=plantilla&tpl=${encodeURIComponent(p.src)}&cat=${encodeURIComponent(cat)}`}
                        style={ctaDark}
                      >
                        Elegir esta
                      </a>
                      <a href={p.src} target="_blank" rel="noreferrer" style={ctaLink}>
                        Ver en pestaña
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {/* LIGHTBOX */}
      {openSrc && (
        <div
          onClick={() => setOpenSrc(null)}
          style={overlay}
          role="dialog"
          aria-modal="true"
        >
          <div onClick={(e) => e.stopPropagation()} style={modal}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 900 }}>{openTitle}</div>
                <div style={{ fontSize: 12, color: "#666" }}>{labelCat(openCat as any)}</div>
              </div>
              <button onClick={() => setOpenSrc(null)} style={closeBtn} aria-label="Cerrar">
                ✕
              </button>
            </div>

            <div style={{ marginTop: 12, borderRadius: 14, overflow: "hidden", border: "1px solid #eee" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={openSrc} alt={openTitle} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href={`/presupuesto?tipo=plantilla&tpl=${encodeURIComponent(openSrc)}&cat=${encodeURIComponent(openCat)}`}
                style={ctaDark}
              >
                Elegir esta plantilla
              </a>
              <a href={openSrc} target="_blank" rel="noreferrer" style={ctaOutline}>
                Abrir en pestaña
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function extractPrefixNumber(src: string) {
  // src = /plantillas/Guarderia/01_algo.jpg
  const name = decodeURIComponent(src.split("/").pop() || "");
  const m = name.match(/^(\d{1,3})[_-]/);
  if (!m) return null;
  return parseInt(m[1], 10);
}

function labelCat(cat: (typeof CATS)[number] | string) {
  switch (cat) {
    case "Guarderia":
      return "Guardería";
    case "Infantil":
      return "Infantil";
    case "Primaria":
      return "Primaria";
    case "Secundaria":
      return "Secundaria";
    case "Bachillerato":
      return "Bachillerato";
    default:
      return String(cat);
  }
}

const grid: React.CSSProperties = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
  gap: 14,
};

const card: React.CSSProperties = {
  border: "1px solid #eee",
  borderRadius: 16,
  padding: 14,
  background: "white",
};

const empty: React.CSSProperties = {
  marginTop: 12,
  padding: 14,
  borderRadius: 14,
  border: "1px solid #eee",
  background: "#fafafa",
  color: "#555",
  lineHeight: 1.45,
};

const chip: React.CSSProperties = {
  textDecoration: "none",
  border: "1px solid #111",
  color: "#111",
  padding: "8px 10px",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 13,
};

const ctaDark: React.CSSProperties = {
  textDecoration: "none",
  background: "#111",
  color: "white",
  padding: "10px 12px",
  borderRadius: 12,
  fontWeight: 900,
  display: "inline-block",
};

const ctaOutline: React.CSSProperties = {
  textDecoration: "none",
  border: "1px solid #111",
  color: "#111",
  padding: "10px 12px",
  borderRadius: 12,
  fontWeight: 900,
  display: "inline-block",
};

const ctaLink: React.CSSProperties = {
  textDecoration: "none",
  color: "#111",
  fontWeight: 800,
  alignSelf: "center",
};

const pill: React.CSSProperties = {
  border: "1px solid #111",
  background: "white",
  color: "#111",
  padding: "8px 10px",
  borderRadius: 999,
  cursor: "pointer",
  fontWeight: 800,
  fontSize: 13,
};

const pillOn: React.CSSProperties = {
  ...pill,
  background: "#111",
  color: "white",
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
  border: "1px solid #eee",
};

const closeBtn: React.CSSProperties = {
  border: "1px solid #ddd",
  background: "white",
  borderRadius: 12,
  padding: "8px 10px",
  cursor: "pointer",
  fontWeight: 900,
};
