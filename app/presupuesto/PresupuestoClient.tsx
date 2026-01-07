"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const LUCIA_PHONE_E164 = "34606849914"; // sin +, formato wa.me
const WHATSAPP_LINK = `https://wa.me/${LUCIA_PHONE_E164}`;

const PRICE = {
  plantilla: 12.5,
  exclusiva: 14.5,
  extra_beca: 8,
  extra_taza: 5,
  extra_sobre: 3,
  iva_pct: 21,
} as const;

type Status = "idle" | "sending" | "sent" | "error";
type EstadoPresupuesto = "informativo" | "interesado";
type TipoOrla = "plantilla" | "exclusiva";

function toIntSafe(v: unknown, fallback = 0) {
  const n = Number(String(v ?? "").replace(",", "."));
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.trunc(n));
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Normaliza a formato wa.me (solo dígitos) asumiendo ES si no hay prefijo
function normalizePhoneForWhatsApp(input: string) {
  const digits = String(input || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length >= 11) return digits; // ya tiene prefijo país
  if (digits.length === 9) return `34${digits}`; // ES
  return digits;
}

export default function PresupuestoClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const tipoQS = sp.get("tipo") || ""; // "plantilla" | "adhoc"
  const tpl = sp.get("tpl") || "";
  const cat = sp.get("cat") || "";

  const tipoOrla: TipoOrla = useMemo(() => {
    if (tipoQS === "plantilla") return "plantilla";
    if (tipoQS === "adhoc") return "exclusiva";
    if (tpl) return "plantilla";
    return "exclusiva";
  }, [tipoQS, tpl]);

  const [status, setStatus] = useState<Status>("idle");
  const [estado, setEstado] = useState<EstadoPresupuesto>("informativo");

  // Extras
  const [extraBeca, setExtraBeca] = useState(false);
  const [extraTaza, setExtraTaza] = useState(false);
  const [extraSobre, setExtraSobre] = useState(false);

  // Para cálculo en vivo
  const [alumnosStr, setAlumnosStr] = useState("");
  const alumnos = useMemo(() => toIntSafe(alumnosStr, 0), [alumnosStr]);

  const banner = useMemo(() => {
    if (tipoOrla === "plantilla" && tpl) {
      const name = decodeURIComponent(tpl.split("/").pop() || "Plantilla");
      return { mode: "plantilla" as const, title: name };
    }
    return { mode: "exclusiva" as const, title: "Diseño exclusivo" };
  }, [tipoOrla, tpl]);

  const calc = useMemo(() => {
    const unitBase = tipoOrla === "plantilla" ? PRICE.plantilla : PRICE.exclusiva;
    const baseSinIva = alumnos * unitBase;

    const extrasSinIva =
      alumnos * (extraBeca ? PRICE.extra_beca : 0) +
      alumnos * (extraTaza ? PRICE.extra_taza : 0) +
      alumnos * (extraSobre ? PRICE.extra_sobre : 0);

    const subtotalSinIva = baseSinIva + extrasSinIva;
    const iva = subtotalSinIva * (PRICE.iva_pct / 100);
    const totalConIva = subtotalSinIva + iva;

    return {
      unitBase: round2(unitBase),
      baseSinIva: round2(baseSinIva),
      extrasSinIva: round2(extrasSinIva),
      subtotalSinIva: round2(subtotalSinIva),
      ivaPct: PRICE.iva_pct,
      iva: round2(iva),
      totalConIva: round2(totalConIva),
    };
  }, [tipoOrla, alumnos, extraBeca, extraTaza, extraSobre]);

  return (
    <div>
      <div className="badge">Presupuesto · Validez 15 días · IVA 21%</div>

      <h1 style={{ marginTop: 14 }}>Solicitar presupuesto de orla 🎓</h1>
      <p style={{ color: "var(--muted)", lineHeight: 1.5 }}>
        Elige el tipo de orla, añade extras si quieres y te enviamos el presupuesto por email (validez 15 días).
      </p>

      {banner && (
        <div className="card" style={{ marginTop: 14, background: "var(--brand-soft)" }}>
          <div style={{ fontWeight: 900 }}>
            {banner.mode === "plantilla" ? "Has elegido una plantilla" : "Has elegido diseño exclusivo"}
          </div>

          {banner.mode === "plantilla" && tpl && (
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tpl}
                alt={banner.title}
                style={{ width: 120, height: 78, objectFit: "cover", borderRadius: 12, border: "1px solid var(--border)" }}
              />
              <div>
                <div style={{ fontWeight: 900 }}>{banner.title}</div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>{cat ? `Categoría: ${cat}` : ""}</div>
                <div style={{ marginTop: 8 }}>
                  <a href="/plantillas" className="btnOutline">
                    Cambiar plantilla
                  </a>
                </div>
              </div>
            </div>
          )}

          {banner.mode !== "plantilla" && (
            <div style={{ marginTop: 8, color: "var(--muted)" }}>
              Perfecto. En comentarios puedes indicar temática, referencias o estilo.
            </div>
          )}
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (status === "sending") return;

            const alumnosN = toIntSafe(alumnosStr, 0);
            if (alumnosN <= 0) {
              setStatus("error");
              return;
            }

            setStatus("sending");

            const form = e.currentTarget as HTMLFormElement;
            const formData = new FormData(form);

            const telefonoRaw = String(formData.get("telefono") || "");
            const telefonoWa = normalizePhoneForWhatsApp(telefonoRaw);

            const payload = {
              centro: String(formData.get("colegio") || "").trim(),
              contacto_nombre: String(formData.get("contacto") || "").trim(),
              contacto_email: String(formData.get("email") || "").trim(),
              contacto_telefono: telefonoRaw.trim(),
              contacto_telefono_wa: telefonoWa,
              ciudad: String(formData.get("zona") || "").trim(),
              fecha_evento: String(formData.get("fechas") || "").trim(),
              curso: String(formData.get("curso") || "").trim(),
              comentarios: String(formData.get("comentarios") || "").trim(),

              estado: estado,
              tipo_orla: tipoOrla,
              alumnos: alumnosN,
              extras: {
                beca_graduacion: extraBeca,
                taza: extraTaza,
                sobre_reforzado: extraSobre,
              },

              plantilla_url: tpl || "",
              categoria_plantilla: cat || "",

              precios: {
                unit_base_sin_iva: calc.unitBase,
                base_sin_iva: calc.baseSinIva,
                extras_sin_iva: calc.extrasSinIva,
                subtotal_sin_iva: calc.subtotalSinIva,
                iva_pct: calc.ivaPct,
                iva: calc.iva,
                total_con_iva: calc.totalConIva,
              },

              whatsapp: {
                lucia_phone_wa: LUCIA_PHONE_E164,
                link_cliente_a_lucia: `https://wa.me/${LUCIA_PHONE_E164}`,
                link_lucia_a_cliente: telefonoWa ? `https://wa.me/${telefonoWa}` : "",
              },

              validez_dias: 15,
              origen: "orlas.lucialco.es",
            };

            try {
              const res = await fetch(
                "https://script.google.com/macros/s/AKfycbyJr53MqrRdeAQMl9ebLjGDmz9VWyihCv9ar3Nksa8WPeECcXVJGK2hZHt1sbnPrBoEYA/exec",
                {
                  method: "POST",
                  headers: { "Content-Type": "text/plain;charset=utf-8" },
                  body: JSON.stringify(payload),
                }
              );

              if (res.ok) {
                setStatus("sent");
                form.reset();
                setEstado("informativo");
                setExtraBeca(false);
                setExtraTaza(false);
                setExtraSobre(false);
                setAlumnosStr("");
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

          <Field label="Número de alumnos">
            <input
              name="alumnos"
              required
              inputMode="numeric"
              type="number"
              min={1}
              step={1}
              placeholder="Ej: 45"
              style={inp}
              value={alumnosStr}
              onChange={(e) => setAlumnosStr(e.target.value)}
            />
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

          {/* Estado */}
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 800 }}>¿Qué quieres hacer ahora?</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <label style={pill(estado === "informativo")}>
                <input
                  type="radio"
                  name="estado"
                  value="informativo"
                  checked={estado === "informativo"}
                  onChange={() => setEstado("informativo")}
                  style={{ marginRight: 8 }}
                />
                Solo quiero el presupuesto (informativo)
              </label>

              <label style={pill(estado === "interesado")}>
                <input
                  type="radio"
                  name="estado"
                  value="interesado"
                  checked={estado === "interesado"}
                  onChange={() => setEstado("interesado")}
                  style={{ marginRight: 8 }}
                />
                Estoy interesado (quiero seguir)
              </label>
            </div>
          </div>

          {/* Extras */}
          <div className="card" style={{ background: "var(--brand-soft)" }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Extras opcionales</div>

            <label style={checkRow}>
              <input type="checkbox" checked={extraBeca} onChange={(e) => setExtraBeca(e.target.checked)} />
              <span>
                Beca de graduación personalizada (cole) — <b>8,00 €</b> / niñ@
              </span>
            </label>

            <label style={checkRow}>
              <input type="checkbox" checked={extraTaza} onChange={(e) => setExtraTaza(e.target.checked)} />
              <span>
                Taza con foto — <b>5,00 €</b> / niñ@
              </span>
            </label>

            <label style={checkRow}>
              <input type="checkbox" checked={extraSobre} onChange={(e) => setExtraSobre(e.target.checked)} />
              <span>
                Sobres reforzados con nombre — <b>3,00 €</b> / niñ@
              </span>
            </label>
          </div>

          {/* Resumen */}
          <div className="card">
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Resumen estimado</div>

            <div style={row}>
              <span>
                Orla {tipoOrla === "plantilla" ? "plantilla" : "diseño exclusivo"} ({calc.unitBase} € / niñ@) ×{" "}
                {alumnos || 0}
              </span>
              <b>{calc.baseSinIva.toFixed(2)} €</b>
            </div>

            <div style={row}>
              <span>Extras</span>
              <b>{calc.extrasSinIva.toFixed(2)} €</b>
            </div>

            <div style={row}>
              <span>Subtotal (sin IVA)</span>
              <b>{calc.subtotalSinIva.toFixed(2)} €</b>
            </div>

            <div style={row}>
              <span>IVA ({calc.ivaPct}%)</span>
              <b>{calc.iva.toFixed(2)} €</b>
            </div>

            <div style={{ ...row, borderTop: "1px dashed var(--border)", paddingTop: 10, marginTop: 10 }}>
              <span style={{ fontWeight: 900 }}>TOTAL</span>
              <span style={{ fontWeight: 900 }}>{calc.totalConIva.toFixed(2)} €</span>
            </div>

            <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)", lineHeight: 1.45 }}>
              Este cálculo es orientativo. El presupuesto que recibirás por email tendrá <b>validez 15 días</b> y quedará
              marcado como <b>{estado === "informativo" ? "SOLO INFORMATIVO" : "INTERESADO"}</b>.
            </div>
          </div>

          <Field label="Comentarios (opcional)">
            <textarea
              name="comentarios"
              placeholder="Temática, estilo, referencias, necesidades, etc."
              rows={4}
              style={txt}
            />
          </Field>

          <button
            type="submit"
            className="btnPrimary"
            disabled={status === "sending"}
            style={{ opacity: status === "sending" ? 0.75 : 1 }}
          >
            {status === "sending" ? "Enviando..." : "Enviar presupuesto"}
          </button>

          {status === "sent" && <div style={okBox}>✅ Enviado. Te llegará por email con validez 15 días.</div>}

          {status === "error" && (
            <div style={errBox}>❌ No se pudo enviar. Revisa el número de alumnos o escribe a Lucía por WhatsApp.</div>
          )}
        </form>

        <p style={{ marginTop: 10, fontSize: 13, color: "var(--muted)", lineHeight: 1.45 }}>
          Nota: el presupuesto se envía por email. Si estás <b>interesado</b>, Lucía podrá ayudarte a cerrar fechas y
          siguientes pasos.
        </p>
      </div>

      <div style={{ marginTop: 14 }}>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--brand-hover)", fontWeight: 900, textDecoration: "none" }}
        >
          💬 Si prefieres, escribe directamente a Lucía por WhatsApp
        </a>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontWeight: 800 }}>{label}</label>
      {children}
    </div>
  );
}

const inp: React.CSSProperties = {
  padding: "12px 12px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  fontSize: 14,
};

const txt: React.CSSProperties = {
  padding: "12px 12px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  fontSize: 14,
  resize: "vertical",
};

const okBox: React.CSSProperties = {
  marginTop: 10,
  padding: 12,
  borderRadius: 12,
  background: "var(--brand-soft)",
  border: "1px solid var(--border)",
  color: "var(--brand-hover)",
  fontWeight: 900,
};

const errBox: React.CSSProperties = {
  marginTop: 10,
  padding: 12,
  borderRadius: 12,
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#7f1d1d",
  fontWeight: 900,
};

const checkRow: React.CSSProperties = { display: "flex", gap: 10, alignItems: "center", padding: "6px 0" };
const row: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", padding: "4px 0" };

function pill(active: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: active ? "1px solid var(--brand)" : "1px solid var(--border)",
    borderRadius: 999,
    padding: "8px 12px",
    background: active ? "var(--brand-soft)" : "white",
    color: active ? "var(--brand-hover)" : "var(--text)",
    fontWeight: 900,
    cursor: "pointer",
  };
}
