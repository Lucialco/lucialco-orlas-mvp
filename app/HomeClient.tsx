"use client";

const WHATSAPP_LINK = "https://wa.me/34606849914";

export default function HomeClient() {
  return (
    <div>
      {/* Hero */}
      <section style={{ padding: "36px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24 }}>
          <div>
            <div className="badge">Orlas escolares · Fotos · Retoque · Diseño</div>

            <h1 style={{ fontSize: 44, lineHeight: 1.05, margin: "14px 0 0" }}>
              Orlas escolares sin complicaciones.
              <br />
              <span style={{ background: "var(--brand-soft)", padding: "0 6px", borderRadius: 10 }}>
                Nos encargamos de todo.
              </span>
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.55, marginTop: 14, color: "var(--text)" }}>
              Fotos, retoque y diseño <b>con creatividad humana</b>. Tú eliges la fecha.
              <br />
              Lucía se ocupa del resto. Y sí: <b>puedes hablar con ella en todo momento</b>.
            </p>

            <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              <a href="/presupuesto" className="btnPrimary" style={{ textDecoration: "none", display: "inline-block" }}>
                Solicitar presupuesto
              </a>

              <a
                href="/plantillas"
                style={{
                  textDecoration: "none",
                  border: "1px solid var(--border)",
                  padding: "12px 14px",
                  borderRadius: 12,
                  fontWeight: 900,
                  color: "var(--text)",
                  display: "inline-block",
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
                  border: "1px solid var(--border)",
                  padding: "12px 14px",
                  borderRadius: 12,
                  fontWeight: 900,
                  color: "var(--text)",
                  display: "inline-block",
                }}
              >
                Habla con Lucía
              </a>
            </div>

            <p style={{ marginTop: 10, color: "var(--muted)", fontSize: 13 }}>
              Respuesta rápida · Proceso claro · Señal del 15% para reservar fecha
            </p>

            <div style={{ marginTop: 22, display: "grid", gap: 10 }}>
              {[
                "Fotografía profesional en el centro",
                "Retoque natural y diseño cuidado",
                "Proceso claro, sin sorpresas",
                "Comunicación directa en todo momento",
              ].map((t) => (
                <div key={t} className="card" style={{ padding: "10px 12px", display: "flex", gap: 10, alignItems: "center" }}>
                  <span aria-hidden style={{ fontWeight: 900, color: "var(--brand-hover)" }}>
                    ✓
                  </span>
                  <span style={{ color: "var(--text)" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side card */}
          <div className="card" style={{ background: "var(--brand-soft)", height: "fit-content" }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Elige el punto de partida</div>

            <div style={{ marginTop: 12, display: "grid", gap: 10, color: "var(--text)" }}>
              <div>🧩 Plantilla (rápido)</div>
              <div>🎨 Diseño a medida (único)</div>
              <div>📅 Fecha de fotos confirmada</div>
              <div>💬 Contacto directo con Lucía</div>
            </div>

            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <a href="/plantillas" className="btnPrimary" style={{ textDecoration: "none", textAlign: "center" }}>
                Ver plantillas
              </a>

              <a
                href="/presupuesto?tipo=adhoc"
                style={{
                  textDecoration: "none",
                  border: "1px solid var(--border)",
                  background: "#fff",
                  color: "var(--text)",
                  padding: "12px 14px",
                  borderRadius: 12,
                  fontWeight: 900,
                  display: "inline-block",
                  textAlign: "center",
                }}
              >
                Pedir diseño a medida
              </a>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 900 }}>Reserva con señal del 15%</div>
              <p style={{ margin: "8px 0 0", color: "var(--muted)", lineHeight: 1.5 }}>
                Una vez aceptado el presupuesto y abonada la señal, concretamos la fecha de fotos y bloqueamos el hueco en el calendario.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "10px 0 10px" }}>
        <h2 style={{ fontSize: 26, margin: "0 0 14px" }}>Cómo funciona</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { n: "1", t: "Pide presupuesto", d: "Cuéntanos curso, número de alumnos y fechas orientativas." },
            { n: "2", t: "Reservamos fecha (señal 15%)", d: "Con la señal bloqueamos el día de las fotos en el calendario." },
            { n: "3", t: "Sesión de fotos + diseño", d: "Lucía realiza las fotos y el equipo diseña la orla." },
            { n: "4", t: "Entrega y revisión", d: "Te enseñamos el resultado y cerramos la entrega." },
          ].map((s) => (
            <div key={s.n} className="card">
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 10,
                  background: "var(--brand)",
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
              <div style={{ color: "var(--muted)", marginTop: 6, lineHeight: 1.45 }}>{s.d}</div>
            </div>
          ))}
        </div>

        {/* Differentiator */}
        <div className="card" style={{ marginTop: 18, background: "white" }}>
          <div className="badge">Creatividad humana</div>
          <div style={{ fontWeight: 900, marginTop: 10 }}>Aquí no hay automatismos sin alma.</div>
          <p style={{ margin: "8px 0 0", color: "var(--muted)", lineHeight: 1.55 }}>
            Cada orla se fotografía, retoca y diseña <b>persona a persona</b>. Atención real y resultados que representan al grupo.
          </p>
        </div>

        {/* Final CTA */}
        <div className="card" style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>¿Lista la orla, sin dolores de cabeza?</div>
            <div style={{ color: "var(--muted)", marginTop: 4 }}>Elige plantilla o pide diseño a medida.</div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/plantillas" className="btnPrimary" style={{ textDecoration: "none" }}>
              Ver plantillas
            </a>
            <a
              href="/presupuesto?tipo=adhoc"
              style={{
                textDecoration: "none",
                border: "1px solid var(--border)",
                padding: "12px 14px",
                borderRadius: 12,
                fontWeight: 900,
                color: "var(--text)",
                background: "#fff",
              }}
            >
              Diseño a medida
            </a>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                border: "1px solid var(--border)",
                padding: "12px 14px",
                borderRadius: 12,
                fontWeight: 900,
                color: "var(--text)",
                background: "#fff",
              }}
            >
              Habla con Lucía
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
