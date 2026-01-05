"use client";
export const dynamic = "force-dynamic";

import type React from "react";
import { useState } from "react";

const WHATSAPP_LINK = "https://wa.me/34606849914"; // luego lo cambiamos por el número real

export default function PresupuestoPage() {
  const [enviado, setEnviado] = useState(false);

  return (
    <main style={{ padding: 24, maxWidth: 820, margin: "0 auto" }}>
      {!enviado ? (
        <>
          <h1 style={{ marginTop: 10 }}>Solicitar presupuesto de orla 🎓</h1>
          <p style={{ color: "#444", lineHeight: 1.5 }}>
            Cuéntanos lo básico y te respondemos rápido. Durante todo el proceso puedes hablar con
            Lucía.
          </p>

          <div style={{ marginTop: 16, border: "1px solid #eee", borderRadius: 14, padding: 16 }}>
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                const form = e.currentTarget as HTMLFormElement;
                const formData = new FormData(form);

                const payload = {
                  centro: String(formData.get("colegio") || ""),
                  contacto_nombre: String(formData.get("contacto") || ""),
                  contacto_email: String(formData.get("email") || ""),
                  contacto_telefono: String(formData.get("telefono") || ""),
                  ciudad: String(formData.get("zona") || ""),
                  alumnos: String(formData.get("alumnos") || ""),
                  profesores: "",
                  fecha_evento: String(formData.get("fechas") || ""),
                  curso: String(formData.get("curso") || ""),
                  comentarios: String(formData.get("comentarios") || ""),
                  origen: String(formData.get("origen") || "orlas.lucialco.es"),
                };

                try {
                  const res = await fetch(
                    "https://script.google.com/macros/s/AKfycbwWgSkL_KlwiemvYWGWmO671fjIi9UXAPjobxHwZN-D5rYmnuAs4aMvGG4c3j362BLpgQ/exec",
                    {
                      method: "POST",
                      headers: { "Content-Type": "text/plain;charset=utf-8" },
                      body: JSON.stringify(payload),
                    }
                  );

                  if (res.ok) {
                    setEnviado(true);

                    // ⏱️ Redirección automática a la home
                    setTimeout(() => {
                      window.location.href = "/";
                    }, 3000);
                  } else {
                    alert("Error al enviar el formulario. Inténtalo de nuevo.");
                  }
                } catch (err) {
                  alert("Error de red. Inténtalo de nuevo.");
                }
              }}
              style={{ display: "grid", gap: 12 }}
            >
              <div style={{ display: "grid", gap: 6 }}>
                <label>Centro / Colegio</label>
                <input name="colegio" required placeholder="Nombre del centro" style={inp} />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label>Curso / Grupo</label>
                <input name="curso" required placeholder="Ej: 6º Primaria / 2º Bach" style={inp} />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label>Número aproximado de alumnos</label>
                <input name="alumnos" required placeholder="Ej: 45" style={inp} />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label>Ciudad / Provincia</label>
                <input name="zona" required placeholder="Ej: Madrid / Toledo" style={inp} />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label>Fechas orientativas para las fotos</label>
                <input name="fechas" required placeholder="Ej: 10–20 marzo" style={inp} />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label>Persona de contacto</label>
                <input name="contacto" required placeholder="Nombre y apellidos" style={inp} />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label>Teléfono</label>
                <input name="telefono" required placeholder="Ej: 6XX XXX XXX" style={inp} />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label>Email</label>
                <input name="email" type="email" required placeholder="tu@email.com" style={inp} />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label>Comentarios (opcional)</label>
                <textarea
                  name="comentarios"
                  placeholder="Detalles, necesidades, etc."
                  rows={4}
                  style={txt}
                />
              </div>

              <input type="hidden" name="origen" value="orlas.lucialco.es" />

              {/* Consentimiento RGPD */}
              <label style={{ fontSize: 13, color: "#444", lineHeight: 1.45 }}>
                <input
                  type="checkbox"
                  required
                  style={{ marginRight: 8, transform: "translateY(1px)" }}
                />
                He leído y acepto la{" "}
                <a href="/politica-privacidad" target="_blank" rel="noreferrer" style={link}>
                  Política de privacidad
                </a>{" "}
                y el{" "}
                <a href="/aviso-legal" target="_blank" rel="noreferrer" style={link}>
                  Aviso legal
                </a>
                .
              </label>

              <button type="submit" style={btn}>
                Enviar solicitud
              </button>
            </form>

            <p style={{ marginTop: 10, fontSize: 13, color: "#666", lineHeight: 1.45 }}>
              Una vez aceptado el presupuesto, se abona una <b>señal del 15%</b> para reservar fecha de
              fotos.
            </p>
          </div>

          <div style={{ marginTop: 14 }}>
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" style={{ ...link, fontWeight: 800 }}>
              💬 Si prefieres, escribe directamente a Lucía por WhatsApp
            </a>
          </div>
        </>
      ) : (
        // ✅ Mensaje post-envío
        <div
          style={{
            marginTop: 60,
            textAlign: "center",
            border: "1px solid #eee",
            borderRadius: 16,
            padding: 32,
            background: "#fafafa",
          }}
        >
          <h2 style={{ marginBottom: 10 }}>¡Solicitud enviada correctamente! ✅</h2>
          <p style={{ color: "#444", lineHeight: 1.5 }}>
            Lucía se pondrá en contacto contigo muy pronto.
            <br />
            En unos segundos volverás a la página principal.
          </p>
        </div>
      )}
    </main>
  );
}

const inp: React.CSSProperties = {
  padding: "12px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  fontSize: 14,
};

const txt: React.CSSProperties = {
  padding: "12px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  fontSize: 14,
  resize: "vertical",
};

const btn: React.CSSProperties = {
  background: "#111",
  color: "white",
  padding: "12px 14px",
  borderRadius: 12,
  border: "none",
  fontWeight: 900,
  cursor: "pointer",
};

const link: React.CSSProperties = {
  color: "#111",
  textDecoration: "none",
};

