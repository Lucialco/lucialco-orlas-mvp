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

            {/* ✅ H1 ajustado (punto 3) */}
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

            <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              <a href="/presupuesto" className="btnPrimary">
                Solicitar presupuesto
              </a>

              <a href="/plantillas" className="btnOutline">
                Ver plantillas
              </a>

              <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="btnOutline">
                Habla con nosotras
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
                <div
                  key={t}
                  className="card"
                  style={{ padding: "10px 12px", display: "flex", gap: 10, alignItems: "center" }}
                >
                  <span aria-hidden style={{ fontWeight: 900, color: "var(--brand-hover)" }}>
                    ✓
                  </span>
                  <span style={{ color: "var(--text)" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ✅ Side card: cambiaremos esto por carrusel (punto 1) en el siguiente bloque */}
          <div className="card" style={{ background: "var(--brand-soft)", height: "fit-content" }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Plantillas destacadas</div>
            <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.55 }}>
              Algunas de las más vistas. Si quieres, mira el catálogo completo.
            </div>

            <div className="card" style={{ marginTop: 12 }}>
              <div style={{ color: "var(--muted)", lineHeight: 1.55 }}>
                (Carrusel en el siguiente paso)
              </div>
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                <a href="/plantillas" className="btnPrimary">
                  Ver todas las plantillas
                </a>
                <a href="/presupuesto?tipo=adhoc" className="btnOutline">
                  Pedir diseño a medida
                </a>
                <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="btnOutline">
                  Habla con nosotras
                </a>
              </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 900 }}>Reserva con señal del 15%</div>
              <p style={{ margin: "8px 0 0", color: "var(--muted)", lineHeight: 1.5 }}>
                Una vez aceptado el presupuesto y abonada la señal, concretamos la fecha de fotos y bloqueamos el hueco
                en el calendario.
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
            { n: "3", t: "Sesión de fotos + diseño", d: "Hacemos las fotos y diseñamos la orla." },
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

        <div className="card" style={{ marginTop: 18, background: "white" }}>
          <div className="badge">Creatividad humana</div>
          <div style={{ fontWeight: 900, marginTop: 10 }}>Aquí no hay automatismos sin alma.</div>
          <p style={{ margin: "8px 0 0", color: "var(--muted)", lineHeight: 1.55 }}>
            Cada orla se fotografía, retoca y diseña <b>persona a persona</b>. Atención real y resultados que representan
            al grupo.
          </p>
        </div>

        <div
          className="card"
          style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>¿Lista la orla, sin dolores de cabeza?</div>
            <div style={{ color: "var(--muted)", marginTop: 4 }}>Elige plantilla o pide diseño a medida.</div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/plantillas" className="btnPrimary">
              Ver plantillas
            </a>
            <a href="/presupuesto?tipo=adhoc" className="btnOutline">
              Diseño a medida
            </a>
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="btnOutline">
              Habla con nosotras
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

