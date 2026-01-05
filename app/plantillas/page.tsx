type Plantilla = {
  src: string;
  title: string;
};

type PlantillasData = Record<string, Plantilla[]>;

const CATS = ["Guarderia", "Infantil", "Primaria", "Secundaria", "Bachillerato"] as const;

async function getPlantillas(): Promise<PlantillasData> {
  // Lee el JSON generado por el workflow
  const mod = await import("../../data/plantillas.json");
  return (mod.default ?? mod) as PlantillasData;
}

export default async function PlantillasPage() {
  const data = await getPlantillas();

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginTop: 10 }}>Plantillas de orlas</h1>
      <p style={{ color: "#444", lineHeight: 1.5, marginTop: 8 }}>
        Explora por categoría. Si eliges una plantilla, la usaremos como base. Si prefieres, también
        puedes pedir un diseño a medida.
      </p>

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a href="/presupuesto?tipo=adhoc" style={ctaDark}>
          Quiero diseño a medida
        </a>
        <a href="/presupuesto" style={ctaOutline}>
          Pedir presupuesto sin elegir ahora
        </a>
      </div>

      {/* Índice por categorías */}
      <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {CATS.map((cat) => (
          <a key={cat} href={`#${cat}`} style={chip}>
            {labelCat(cat)}
          </a>
        ))}
      </div>

      {/* Secciones */}
      {CATS.map((cat) => {
        const items = data[cat] ?? [];

        return (
          <section key={cat} id={cat} style={{ marginTop: 34 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0 }}>{labelCat(cat)}</h2>
              <div style={{ color: "#666", fontSize: 13 }}>{items.length} plantilla(s)</div>
            </div>

            {items.length === 0 ? (
              <div style={empty}>
                Aún no hay plantillas en esta categoría. (Cuando subas JPG a Drive y ejecutes Sync,
                aparecerán aquí.)
              </div>
            ) : (
              <div style={grid}>
                {items.map((p) => (
                  <div key={p.src} style={card}>
                    <a href={p.src} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
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
                    </a>

                    <div style={{ marginTop: 10, fontWeight: 900, color: "#111" }}>{p.title}</div>

                    <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <a
                        href={`/presupuesto?tipo=plantilla&tpl=${encodeURIComponent(p.src)}&cat=${encodeURIComponent(cat)}`}
                        style={ctaDark}
                      >
                        Elegir esta
                      </a>
                      <a href={p.src} target="_blank" rel="noreferrer" style={ctaLink}>
                        Ver grande
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </main>
  );
}

function labelCat(cat: (typeof CATS)[number]) {
  // Presentación bonita (con acento)
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
      return cat;
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
