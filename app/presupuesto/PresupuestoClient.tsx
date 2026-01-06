"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const WHATSAPP_LINK = "https://wa.me/34606849914";

export default function PresupuestoClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const tipo = sp.get("tipo") || "";
  const tpl = sp.get("tpl") || "";
  const cat = sp.get("cat") || "";

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const banner = useMemo(() => {
    if (tipo === "plantilla" && tpl) {
      const name = decodeURIComponent(tpl.split("/").pop() || "Plantilla");
      return { mode: "plantilla" as const, title: name };
    }
    if (tipo === "adhoc") return { mode: "adhoc" as const, title: "Diseño a medida" };
    return null;
  }, [tipo, tpl]);

  return (
    <main style={{ fontFamily: "Arial", padding: 24, maxWidth: 820, margin: "0 auto" }}>
      <h1 style={{ marginTop: 10 }}>Solicitar presupuesto de orla 🎓</h1>
      <p style={{ color: "#444", lineHeight: 1.5 }}>
        Cuéntanos lo básico y te respondemos rápido. Durante todo el proceso puedes hablar con Lucía.
      </p>

      {banner && (
        <div style={bannerBox}>
          <div style={{ fontWeight: 900 }}>
            {banner.mode === "plantilla" ? "Has elegido una plantilla" : "Has elegido diseño a medida"}
          </div>

          {banner.mode === "plantilla" && tpl && (
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tpl}
                alt={banner.title}
                style={{ width: 120, height: 78, objectFit: "cover", borderRadius: 12, border: "1px solid #eee" }}
              />
              <div>
                <div style={{ fontWeight: 900 }}>{banner.title}</div>
                <div style={{ color: "#666", fontSize: 13 }}>{cat ? `Categoría: ${cat}` : ""}</div>
                <div style={{ marginTop: 8 }}>
                  <a href="/plantillas" style={linkBtn}>
                    Cambiar plantilla
                  </a>
                </div>
              </div>
            </div>
          )}

          {banner.mode === "adhoc" && (
            <div style={{ marginTop: 8, color: "#444" }}>
              Perfecto. Indícanos en comentarios el estilo o referencias si quieres.
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 16, border: "1px solid #eee", borderRadius: 14, padding: 16 }}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (status === "sending") return;

            setStatus("sending");

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

              tipo_orla: tipo || "",
              plantilla_url: tpl || "",
              categoria_plantilla: cat || "",

              origen: "orlas.lucialco.es",
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
                setStatus("sent");
                form.reset();
                setTimeout(() => router.push("/"), 2500);
              } else {
                setStatus("error");
              }
            } catch {
              setStatus("error");
            }
          }}
          style={{ display: "grid", gap: 12 }}
        >
          <Field label="Centro / Colegio">
            <input name="colegio" required placeholder="Nombre del centro" style={inp} />
          </Field>

          <Field label="Curso / Grupo">
            <input name="curso" required placeholder="Ej: 6º Primaria / 2º Bach" style={inp} />
          </Field>

          <Field label="Número aproximado de alumnos">
            <input name="alumnos" required placeholder="Ej: 45" style={inp} />
          </Field>

          <Field label="Ciudad / Provincia">
            <input name="zona" required placeholder="Ej: Madrid / Toledo" style={inp} />
          </Field>

          <Field label="Fechas orientativas para las fotos">
            <input name="fechas" required placeholder="Ej: 10–20 marzo" style={inp} />
          </Field>

          <Field label="Persona de contacto">
            <input name="contacto" required placeholder="Nombre y apellidos" style={inp} />
          </Field>

          <Field label="Teléfono">
            <input name="telefono" required placeholder="Ej: 6XX XXX XXX" style={inp} />
          </Field>

          <Field label="Email">
            <input name="email" type="email" required placeholder="tu@email.com" style={inp} />
          </Field>

          <Field label="Comentarios (opcional)">
            <textarea name="comentarios" placeholder="Detalles, necesidades, etc." rows={4} style={txt} />
          </Field>

          <button type="submit" style={btn} disabled={status === "sending"}>
            {status === "sending" ? "Enviando..." : "Enviar solicitud"}
          </button>

          {status === "sent" && <div style={okBox}>✅ Formulario enviado. En unos segundos volvemos a la página principal.</div>}
          {status === "error" && (
            <div style={errBox}>❌ No se pudo enviar. Prueba de nuevo o escribe a Lucía por WhatsApp.</div>
          )}
        </form>

        <p style={{ marginTop: 10, fontSize: 13, color: "#666", lineHeight: 1.45 }}>
          Una vez aceptado el presupuesto, se abona una <b>señal del 15%</b> para reservar fecha de fotos.
        </p>
      </div>

      <div style={{ marginTop: 14 }}>
        <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" style={{ color: "#111", fontWeight: 800, textDecoration: "none" }}>
          💬 Si prefieres, escribe directamente a Lucía por WhatsApp
        </a>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label>{label}</label>
      {children}
    </div>
  );
}

const inp: React.CSSProperties = { padding: "12px 12px", borderRadius: 10, border: "1px solid #ddd", fontSize: 14 };
const txt: React.CSSProperties = { padding: "12px 12px", borderRadius: 10, border: "1px solid #ddd", fontSize: 14, resize: "vertical" };
const btn: React.CSSProperties = { background: "#111", color: "white", padding: "12px 14px", borderRadius: 12, border: "none", fontWeight: 900, cursor: "pointer" };

const bannerBox: React.CSSProperties = { marginTop: 14, border: "1px solid #eee", borderRadius: 16, padding: 14, background: "#fafafa" };
const linkBtn: React.CSSProperties = { display: "inline-block", textDecoration: "none", border: "1px solid #111", borderRadius: 12, padding: "8px 10px", fontWeight: 900, color: "#111" };

const okBox: React.CSSProperties = { marginTop: 10, padding: 12, borderRadius: 12, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", fontWeight: 800 };
const errBox: React.CSSProperties = { marginTop: 10, padding: 12, borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#7f1d1d", fontWeight: 800 };
