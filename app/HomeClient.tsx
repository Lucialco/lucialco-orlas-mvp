"use client";

import { useMemo, useState } from "react";

const WHATSAPP_LINK = "https://wa.me/34606849914";

type CarouselItem = {
  kind: "plantilla" | "extra";
  title: string;
  subtitle: string;
  href: string;
  img: string;
};

function clampIndex(i: number, len: number) {
  if (len <= 0) return 0;
  return ((i % len) + len) % len;
}

function ArrowBtn({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={children === "‹" ? "Anterior" : "Siguiente"}
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        border: "1px solid var(--border)",
        background: "white",
        fontWeight: 900,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

export default function HomeClient() {
  const items = useMemo<CarouselItem[]>(
    () => [
      {
        kind: "plantilla",
        title: "Plantilla 28",
        subtitle: "Guardería / Infantil",
        href: "/plantillas",
        img: "/plantilla-28.webp",
      },
      {
        kind: "plantilla",
        title: "Plantilla 12",
        subtitle: "Infantil",
        href: "/plantillas",
        img: "/plantilla-12.webp",
      },
      {
        kind: "extra",
        title: "Beca personalizada",
        subtitle: "Un detalle que eleva la orla",
        href: "/presupuesto",
        img: "/extra-beca.webp",
      },
      {
        kind: "extra",
        title: "Taza con foto",
        subtitle: "Regalo perfecto para familias",
        href: "/presupuesto",
        img: "/extra-taza.webp",
      },
      {
        kind: "extra",
        title: "Fotos de recuerdo",
        subtitle: "Pack para las familias",
        href: "/presupuesto",
        img: "/extra-fotos.webp",
      },
    ],
    []
  );

  const [idx, setIdx] = useState(0);
  const current = items[clampIndex(idx, items.length)];
  const [imgOk, setImgOk] = useState(true);

  const onPrev = () => {
    setImgOk(true);
    setIdx((p) => clampIndex(p - 1, items.length));
  };
  const onNext = () => {
    setImgOk(true);
    setIdx((p) => clampIndex(p + 1, items.length));
  };

  const btnCell: React.CSSProperties = {
    width: "100%",
    minHeight: 42,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "8px 12px",
    fontSize: 14,
    lineHeight: 1.2,
  };

  return (
    <div>
      {/* HERO */}
      <section style={{ padding: "36px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24 }}>
          <div>
            <div className="badge">Orlas escolares · Fotos · Retoque · Diseño</div>

            <h1 style={{ fontSize: 46, lineHeight: 1.05, margin: "14px 0 0" }}>
              <span style={{ background: "var(--brand-soft)", padding: "0 8px", borderRadius: 10, fontWeight: 900 }}>
                Orlas escolares
              </span>{" "}
              <span style={{ fontWeight: 700 }}>sin complicaciones.</span>
              <br />
              <span style={{ fontSize: 40 }}>
                <span style={{ background: "var(--brand-soft)", padding: "0 6px", borderRadius: 10, fontWeight: 900 }}>
                  Nos encargamos de todo.
                </span>
              </span>
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.55, marginTop: 14, color: "var(--text)" }}>
              Fotos, retoque y diseño <b>con creatividad humana</b>. Tú eliges la fecha.
              <br />
              Nosotras nos ocupamos del resto. Y sí: <b>puedes hablar con nosotras en todo momento</b>.
            </p>

            <div
              style={{
                marginTop: 18,
                display: "grid",
                gap: 10,
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              }}
            >
              <a href="/plantillas" className="btnOutline" style={btnCell}>
                Ver plantillas
              </a>

              <a href="/presupuesto" className="btnPrimary" style={btnCell}>
                Solicitar presupuesto
              </a>

              <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="btnOutline" style={btnCell}>
                Habla con nosotras
              </a>
            </div>

            <p style={{ marginTop: 10, color: "var(--muted)", fontSize: 13 }}>Respuesta rápida · Proceso claro</p>
          </div>

          {/* CARRUSEL */}
          <div className="card" style={{ background: "var(--brand-soft)", height: "fit-content" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16 }}>Destacados</div>
                <div style={{ marginTop: 6, color: "var(--muted)" }}>Plantillas y extras más elegidos.</div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <ArrowBtn onClick={onPrev}>‹</ArrowBtn>
                <ArrowBtn onClick={onNext}>›</ArrowBtn>
              </div>
            </div>

            <div className="card" style={{ marginTop: 12, padding: 0, overflow: "hidden" }}>
              <a href={current?.href || "/plantillas"} style={{ textDecoration: "none", display: "block" }}>
                <div style={{ width: "100%", aspectRatio: "16/10", background: "white", position: "relative" }}>
                  <img
                    src={current?.img}
                    alt={current?.title || "Destacado"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: imgOk ? "block" : "none",
                    }}
                    loading="lazy"
                    onLoad={() => setImgOk(true)}
                    onError={() => setImgOk(false)}
                  />
                </div>

                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 900 }}>{current?.title}</div>
                  <div style={{ color: "var(--muted)" }}>{current?.subtitle}</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "10px 0 10px" }}>
        <h2 style={{ fontSize: 26, margin: "0 0 14px" }}>Cómo funciona</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { n: "1", t: "Pide presupuesto", d: "Cuéntanos curso, número de alumnos y fechas orientativas." },
            { n: "2", t: "Reservamos fecha", d: "Concretamos el día de las fotos." },
            { n: "3", t: "Fotos y diseño", d: "Hacemos las fotos y diseñamos la orla." },
            { n: "4", t: "Entrega", d: "Revisamos contigo y entregamos el resultado final." },
          ].map((s) => (
            <div key={s.n} className="card">
              <div style={{ fontWeight: 900 }}>{s.t}</div>
              <div style={{ color: "var(--muted)" }}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BLOQUE SEO (nuevo) */}
      <section style={{ marginTop: 40 }}>
        <h2>Orlas escolares personalizadas para colegios</h2>

        <p>
          En Lucialco diseñamos <strong>orlas escolares personalizadas</strong> para centros de educación infantil,
          primaria y secundaria. Nos encargamos de todo el proceso: fotografía, retoque y diseño final de la orla.
        </p>

        <p>
          Nuestro objetivo es que cada colegio pueda organizar su orla de fin de curso de forma sencilla y sin
          complicaciones, con un resultado cuidado y profesional para cada promoción.
        </p>

        <p>
          Trabajamos con <strong>orlas escolares para infantil, primaria y secundaria</strong>, adaptando el estilo al
          centro educativo y ofreciendo plantillas o diseños totalmente personalizados.
        </p>
      </section>
    </div>
  );
}





