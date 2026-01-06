"use client";

const WHATSAPP_LINK = "https://wa.me/34606849914"; // Cambia luego por el número real

export default function HomeClient() {
  return (
    <main style={{ fontFamily: "Arial", background: "#fff" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid #eee",
          position: "sticky",
          top: 0,
          background: "white",
          zIndex: 10,
        }}
      >
        <div style={{ fontWeight: 800, letterSpacing: 0.2 }}>Lucialco · Orlas</div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href="/plantillas"
            style={{
              textDecoration: "none",
              border: "1px solid #111",
              padding: "10px 12px",
              borderRadius: 10,
              fontWeight: 800,
              color: "#111",
            }}
          >
            Ver plantillas
          </a>

          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: "none",
              border: "1px solid #111",
              padding: "10px 12px",
              borderRadius: 10,
              fontWeight: 700,
              color: "#111",
            }}
          >
            Habla con Lucía
          </a>

          <a
            href="/presupuesto"
            style={{
              textDecoration: "none",
              background: "#111",
              color: "white",
              padding: "10px 12px",
              borderRadius: 10,
              fontWeight: 800,
            }}
          >
            Solicitar presupuesto
          </a>
        </div>
      </div>

      {/* Hero */}
      <section style={{ padding: "44px 20px", maxWidth: 980, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24 }}>
          <div>
            <h1 style={{ fontSize: 44, lineHeight: 1.05, margin: 0 }}>
              Orlas escolares sin complicaciones.
              <br />
              <span style={{ background: "#fff3b0" }}>Nos encargamos de todo.</span>
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.55, marginTop: 14, color: "#333" }}>
              Fotos, retoque y diseño <b>con creatividad humana (CR)</b>. Tú eliges la fecha.
              <br />
              Lucía se ocupa del resto. Y sí: <b>puedes hablar con ella en todo momento</b>.
            </p>

            <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              <a
                href="/presupuesto"
                style={{
                  textDecoration: "none",
                  background: "#111",
                  color: "white",
                  padding: "14px 16px",
                  borderRadius: 12,
                  fontWeight: 900,
                }}
              >
                Solicitar presupuesto
              </a>

              <a
                href="/plantillas"
                style={{
                  textDecoration: "none",
                  border: "1px solid #111",
                  padding: "14px 16px",
                  borderRadius: 12,
                  fontWeight: 900,
                  color: "#111",
                }}
              >
                Ver plantillas
              </a>

              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: "none",
                  border: "1px solid #111",
                  padding: "14px 16px",
                  borderRadius: 12,
                  fontWeight: 800,
                  color: "#111",
                }}
              >
                Habla con Lucía
              </a>
            </div>

            <p style={{ marginTop: 10, color: "#666", fontSize: 13 }}>
              Respuesta rápida · Proceso claro · Señal del 15% para reservar fecha
            </p>

            <div style={{ marginTop: 22, display: "grid", gap: 10 }}>
              {[
                "Fotografía profesional en el centro",
                "Retoque natural y diseño cuidado",
                "Proceso claro, sin sorpresas",
                "Comunicación directa en todo momento",
              ].map((t) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    border: "1px solid #eee",
                    borderRadius: 12,
                  }}
                >
                  <span aria-hidden style={{ fontWeight: 900 }}>
                    ✓
                  </span>
                  <span style={{ color: "#222" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side card */}
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 16,
              padding: 18,
              background: "#fafafa",
              height: "fit-content",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 16 }}>Elige el punto de partida</div>

            <div style={{ marginTop: 12, display: "grid", gap: 10, color: "#222" }}>
              <div>🧩 Plantilla (rápido)</div>
              <div>🎨 Diseño a medida (único)</div>
              <div>📅 Fecha de fotos confirmada</div>
              <div>💬 Contacto directo con Lucía</div>
            </div>

            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <a href="/plantillas" style={ctaDark}>
                Ver plantillas
              </a>
              <a href="/presupuesto?tipo=adhoc" style={ctaOutline}>
                Pedir diseño a medida
              </a>
            </div>

            <div
              style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 14,
                background: "white",
                border: "1px solid #eee",
              }}
            >
              <div style={{ fontWeight: 900 }}>Reserva con señal del 15%</div>
              <p style={{ margin: "8px 0 0", color: "#444", lineHeight: 1.5 }}>
                Una vez aceptado el presupuesto y abonada la señal, concretamos la fecha de fotos y
                bloqueamos el hueco en el calendario.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "10px 20px 44px", maxWidth: 980, margin: "0 auto" }}>
        <h2 style={{ fontSize: 26, margin: "0 0 14px" }}>Cómo funciona</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { n: "1", t: "Pide presupuesto", d: "Cuéntanos curso, número de alumnos y fechas orientativas." },
            { n: "2", t: "Reservamos fecha (señal 15%)", d: "Con la señal bloqueamos el día de las fotos en el calendario." },
            { n: "3", t: "Sesión de fotos + diseño", d: "Lucía realiza las fotos y el equipo diseña la orla con CR." },
            { n: "4", t: "Entrega y revisión", d: "Te enseñamos el resultado y cerramos la entrega." },
          ].map((s) => (
            <div
              key={s.n}
              style={{
                border: "1px solid #eee",
                borderRadius: 16,
                padding: 14,
                background: "white",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 10,
                  background: "#111",
                  color: "white",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  marginBottom: 10,
                }}
              >
                {s.n}
              </div>
              <div style={{ fontWeight: 900 }}>{s.t}</div>
              <div style={{ color: "#444", marginTop: 6, lineHeight: 1.45 }}>{s.d}</div>
            </div>
          ))}
        </div>

        {/* Differentiator */}
        <div
          style={{
            marginTop: 18,
            borderRadius: 16,
            padding: 16,
            background: "#fff3b0",
            border: "1px solid #f1e08a",
          }}
        >
          <div style={{ fontWeight: 900 }}>Aquí no hay automatismos sin alma.</div>
          <p style={{ margin: "8px 0 0", color: "#333", lineHeight: 1.55 }}>
            Cada orla se fotografía, retoca y diseña <b>persona a persona</b>. Creatividad humana,
            atención real y resultados que representan al grupo.
          </p>
        </div>

        {/* Final CTA */}
        <div
          style={{
            marginTop: 18,
            border: "1px solid #eee",
            borderRadius: 16,
            padding: 16,
            background: "#fafafa",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>¿Lista la orla, sin dolores de cabeza?</div>
            <div style={{ color: "#444", marginTop: 4 }}>Elige plantilla o pide diseño a medida.</div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/plantillas" style={ctaDark}>
              Ver plantillas
            </a>
            <a href="/presupuesto?tipo=adhoc" style={ctaOutline}>
              Diseño a medida
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #eee", padding: "18px 20px", color: "#666" }}>
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto",
            fontSize: 13,
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div>© {new Date().getFullYear()} Lucialco</div>
          <div>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#111", fontWeight: 800, textDecoration: "none" }}
            >
              Contacto directo con Lucía
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

const ctaDark: React.CSSProperties = {
  textDecoration: "none",
  background: "#111",
  color: "white",
  padding: "12px 14px",
  borderRadius: 12,
  fontWeight: 900,
  display: "inline-block",
  textAlign: "center",
};

const ctaOutline: React.CSSProperties = {
  textDecoration: "none",
  border: "1px solid #111",
  color: "#111",
  padding: "12px 14px",
  borderRadius: 12,
  fontWeight: 900,
  display: "inline-block",
  textAlign: "center",
};
