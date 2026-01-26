"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const LUCIA_PHONE_E164 = "34606849914";
const WHATSAPP_LINK = `https://wa.me/${LUCIA_PHONE_E164}`;

// ✅ Provincias (select obligatorio)
const PROVINCIAS = [
  "Álava",
  "Albacete",
  "Alicante",
  "Almería",
  "Asturias",
  "Ávila",
  "Badajoz",
  "Barcelona",
  "Burgos",
  "Cáceres",
  "Cádiz",
  "Cantabria",
  "Castellón",
  "Ciudad Real",
  "Córdoba",
  "Cuenca",
  "Gerona",
  "Granada",
  "Guadalajara",
  "Guipúzcoa",
  "Huelva",
  "Huesca",
  "Islas Baleares",
  "Jaén",
  "La Coruña",
  "La Rioja",
  "Las Palmas",
  "León",
  "Lérida",
  "Lugo",
  "Madrid",
  "Málaga",
  "Murcia",
  "Navarra",
  "Orense",
  "Palencia",
  "Pontevedra",
  "Salamanca",
  "Santa Cruz de Tenerife",
  "Segovia",
  "Sevilla",
  "Soria",
  "Tarragona",
  "Teruel",
  "Toledo",
  "Valencia",
  "Valladolid",
  "Vizcaya",
  "Zamora",
  "Zaragoza",
] as const;

const PRICE = {
  plantilla: 12.5,
  exclusiva: 14.5,

  // ✅ Digital solo fuera de Madrid/Toledo
  digital: 8.5,
  envio_nacional: 15,

  extra_beca: 8,
  extra_taza: 5,
  extra_sobre: 3,
  extra_fotos_recuerdo: 4.5, // ✅ (por alumno)
  iva_pct: 21,
} as const;

type Status = "idle" | "sending" | "sent" | "error";
type EstadoPresupuesto = "informativo" | "interesado";
type TipoOrla = "plantilla" | "exclusiva" | "digital";

type FieldKey = "contacto" | "email" | "telefono" | "alumnos" | "provincia";
type Errors = Partial<Record<FieldKey, string>>;

function toIntSafe(v: unknown, fallback = 0) {
  const n = Number(String(v ?? "").replace(",", "."));
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.trunc(n));
}
function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
function normalizePhoneForWhatsApp(input: string) {
  const digits = String(input || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length >= 11) return digits;
  if (digits.length === 9) return `34${digits}`;
  return digits;
}
function normalizeName(v: string) {
  return String(v || "").trim().replace(/\s+/g, " ");
}
function normalizeEmail(v: string) {
  return String(v || "").trim().toLowerCase();
}
function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function isValidPhoneES(v: string) {
  const digits = String(v || "").replace(/\D/g, "");
  if (digits.length === 9) return true;
  if (digits.length === 11 && digits.startsWith("34")) return true;
  return false;
}
function isLocalProvincia(p: string) {
  return p === "Madrid" || p === "Toledo";
}
function prettyTplName(url: string) {
  try {
    const name = decodeURIComponent(url.split("/").pop() || "Plantilla");
    return name.replace(/\.webp$/i, "").replace(/\.jpe?g$/i, "").replace(/\.png$/i, "");
  } catch {
    return "Plantilla";
  }
}

export default function PresupuestoClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const tipoQS = (sp.get("tipo") || "").toLowerCase(); // "plantilla" | "adhoc" | "digital"
  const tplOld = sp.get("tpl") || "";
  const catOld = sp.get("cat") || "";
  const tplNew = sp.get("plantilla_url") || "";
  const catNew = sp.get("categoria_plantilla") || "";

  const tpl = tplOld || tplNew;
  const cat = catOld || catNew;

  const hasTpl = !!tpl;
  const hasTipo = tipoQS === "plantilla" || tipoQS === "adhoc" || tipoQS === "digital";

  // ✅ si viene plantilla, es plantilla. si viene tipo=adhoc, es exclusiva. si viene tipo=digital, digital. si no viene nada, mostramos selector.
  const needsChoice = useMemo(() => !hasTipo && !hasTpl, [hasTipo, hasTpl]);

  const tipoOrlaFromUrl: TipoOrla = useMemo(() => {
    if (tipoQS === "plantilla") return "plantilla";
    if (tipoQS === "adhoc") return "exclusiva";
    if (tipoQS === "digital") return "digital";
    if (hasTpl) return "plantilla";
    return "plantilla";
  }, [tipoQS, hasTpl]);

  // ✅ provincia obligatoria
  const [provincia, setProvincia] = useState<string>("");

  const esLocal = useMemo(() => isLocalProvincia(provincia), [provincia]);
  const provinciaOk = !!provincia;

  // ✅ tipo efectivo según provincia (regla negocio)
  const tipoOrla: TipoOrla = useMemo(() => {
    if (!provinciaOk) return tipoOrlaFromUrl;
    if (esLocal) {
      // En Madrid/Toledo NO mostramos digital
      return tipoOrlaFromUrl === "digital" ? "plantilla" : tipoOrlaFromUrl;
    }
    // Fuera: modalidad DIGITAL (aunque el usuario venga de plantillas)
    return "digital";
  }, [provinciaOk, esLocal, tipoOrlaFromUrl]);

  // ✅ fuera => si no viene tipo=digital en URL, lo ponemos por limpieza (pero permitimos tpl igualmente)
  useEffect(() => {
    if (!provinciaOk) return;
    if (!esLocal) {
      if (tipoQS !== "digital") router.replace("/presupuesto?tipo=digital");
    } else {
      if (tipoQS === "digital") router.replace("/presupuesto");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinciaOk, esLocal]);

  const [status, setStatus] = useState<Status>("idle");
  const [estado, setEstado] = useState<EstadoPresupuesto>("informativo");

  const [errors, setErrors] = useState<Errors>({});
  const [formMsg, setFormMsg] = useState<string>("");

  const [extraBeca, setExtraBeca] = useState(false);
  const [extraTaza, setExtraTaza] = useState(false);
  const [extraSobre, setExtraSobre] = useState(false);
  const [extraFotosRecuerdo, setExtraFotosRecuerdo] = useState(false);

  const [alumnosStr, setAlumnosStr] = useState("");
  const alumnos = useMemo(() => toIntSafe(alumnosStr, 0), [alumnosStr]);

  // ✅ Banner: en DIGITAL, si hay plantilla, la enseñamos
  const banner = useMemo(() => {
    if (tipoOrla === "digital") {
      return {
        mode: "digital" as const,
        title: hasTpl ? `Plantilla elegida (Digital): ${prettyTplName(tpl)}` : "Orla Digital a Distancia",
      };
    }
    if (tipoOrla === "plantilla" && tpl) {
      return { mode: "plantilla" as const, title: prettyTplName(tpl) };
    }
    return { mode: "exclusiva" as const, title: "Diseño exclusivo" };
  }, [tipoOrla, tpl, hasTpl]);

  const calc = useMemo(() => {
    const unitBase =
      tipoOrla === "plantilla"
        ? PRICE.plantilla
        : tipoOrla === "exclusiva"
        ? PRICE.exclusiva
        : PRICE.digital;

    const baseSinIva = alumnos * unitBase;

    const extrasSinIva =
      alumnos * (extraBeca ? PRICE.extra_beca : 0) +
      alumnos * (extraTaza ? PRICE.extra_taza : 0) +
      alumnos * (extraSobre ? PRICE.extra_sobre : 0) +
      alumnos * (extraFotosRecuerdo ? PRICE.extra_fotos_recuerdo : 0);

    const envioSinIva = tipoOrla === "digital" && alumnos > 0 ? PRICE.envio_nacional : 0;

    const subtotalSinIva = baseSinIva + extrasSinIva + envioSinIva;
    const iva = subtotalSinIva * (PRICE.iva_pct / 100);
    const totalConIva = subtotalSinIva + iva;

    return {
      unitBase: round2(unitBase),
      baseSinIva: round2(baseSinIva),
      extrasSinIva: round2(extrasSinIva),
      envioSinIva: round2(envioSinIva),
      subtotalSinIva: round2(subtotalSinIva),
      ivaPct: PRICE.iva_pct,
      iva: round2(iva),
      totalConIva: round2(totalConIva),
    };
  }, [tipoOrla, alumnos, extraBeca, extraTaza, extraSobre, extraFotosRecuerdo]);

  const clearError = (k: FieldKey) => {
    setErrors((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
    setFormMsg("");
    if (status === "error") setStatus("idle");
  };

  const errorClass = (k: FieldKey) => (errors[k] ? "inputError" : "");

  // ✅ FLUJO: selector
  const goPlantillasDirect = () => router.push("/plantillas");
  const chooseExclusiva = () => router.replace("/presupuesto?tipo=adhoc");
  const chooseDigital = () => router.replace("/presupuesto?tipo=digital");

  const equalBtn: React.CSSProperties = {
    width: "100%",
    minHeight: 46,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const ChoiceBlock = () => {
    return (
      <div className="card" style={{ marginTop: 14, background: "var(--brand-soft)" }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>Antes, una cosa rápida</div>
        <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
          Indica la provincia del centro para mostrarte las opciones disponibles.
        </div>

        <div style={{ marginTop: 12 }}>
          <Field label="Provincia *">
            <select
              name="provincia"
              required
              value={provincia}
              onChange={(e) => {
                setProvincia(e.target.value);
                clearError("provincia");
              }}
              style={{ ...inp, background: "white" }}
              className={errorClass("provincia")}
            >
              <option value="">Selecciona provincia…</option>
              {PROVINCIAS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {!provinciaOk ? null : esLocal ? (
          <>
            <div style={{ marginTop: 14, fontWeight: 900 }}>Opciones presenciales (Madrid/Toledo)</div>
            <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
              En tu zona hacemos <b>fotos in situ</b>, retoque, maquetación e impresión A3 con entrega en mano.
            </div>

            <div
              style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: 14,
              }}
            >
              <div style={choiceCard}>
                <div>
                  <div style={choiceHeader}>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>Orla desde plantilla</div>
                    <div style={choicePrice}>{PRICE.plantilla.toFixed(2)} € / niñ@</div>
                  </div>

                  <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
                    Eliges una plantilla que ya tenemos y la adaptamos a tu centro (nombres, logos, composición y revisión
                    final).
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  <button type="button" className="btnPrimary" style={equalBtn} onClick={goPlantillasDirect}>
                    Ver plantillas
                  </button>
                </div>
              </div>

              <div style={choiceCard}>
                <div>
                  <div style={choiceHeader}>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>Orla con diseño exclusivo</div>
                    <div style={choicePrice}>{PRICE.exclusiva.toFixed(2)} € / niñ@</div>
                  </div>

                  <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
                    Nos dices temática/estilo y diseñamos una orla única desde cero. Ideal si quieres algo realmente
                    personalizado.
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "grid" }}>
                  <button type="button" className="btnPrimary" style={equalBtn} onClick={chooseExclusiva}>
                    Quiero diseño exclusivo
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginTop: 14, fontWeight: 900 }}>Servicio nacional (modalidad digital)</div>
            <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
              Para tu provincia trabajamos en <b>modalidad digital</b>: el cole hace las fotos y Lucía realiza el{" "}
              <b>retoque</b>, la <b>maquetación</b> y el <b>diseño final</b>. (+{PRICE.envio_nacional} € logística)
            </div>

            <div
              style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: 14,
              }}
            >
              <div style={choiceCard}>
                <div>
                  <div style={choiceHeader}>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>Orla Digital a Distancia</div>
                    <div style={choicePrice}>{PRICE.digital.toFixed(2)} € / niñ@</div>
                  </div>

                  <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
                    Puedes elegir plantilla o pedir una composición a medida. El precio unitario es el mismo en digital.
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  <button type="button" className="btnOutline" style={equalBtn} onClick={goPlantillasDirect}>
                    Ver plantillas (Digital)
                  </button>
                  <button type="button" className="btnPrimary" style={equalBtn} onClick={chooseDigital}>
                    Continuar (Digital)
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      <style jsx global>{`
        .inputError {
          border: 1px solid #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
        }
        .tipWrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .tipIcon {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          border: 1px solid var(--border);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 12px;
          color: var(--brand-hover);
          background: white;
          cursor: help;
          user-select: none;
        }
        .tipBox {
          position: absolute;
          left: 0;
          top: 26px;
          width: min(320px, 78vw);
          background: white;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 10px 12px;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
          color: var(--text);
          line-height: 1.45;
          font-size: 13px;
          display: none;
          z-index: 20;
        }
        .tipWrap:hover .tipBox {
          display: block;
        }
      `}</style>

      <div className="badge">Presupuesto · Validez 15 días · IVA 21%</div>

      <h1 style={{ marginTop: 14 }}>Solicitar presupuesto de orla 🎓</h1>
      <p style={{ color: "var(--muted)", lineHeight: 1.5 }}>
        Indica la provincia, el número de alumnos y extras si quieres. Te enviamos el presupuesto por email (validez 15
        días).
      </p>

      {needsChoice && <ChoiceBlock />}

      {!needsChoice && (
        <>
          <div className="card" style={{ marginTop: 14, background: "var(--brand-soft)" }}>
            <div style={{ fontWeight: 900 }}>Provincia del centro *</div>
            <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
              {provinciaOk
                ? esLocal
                  ? "En Madrid/Toledo ofrecemos servicio presencial."
                  : "En tu provincia trabajamos en modalidad digital (el cole hace las fotos)."
                : "Selecciona la provincia para continuar."}
            </div>

            <div style={{ marginTop: 12 }}>
              <Field label="Provincia *">
                <select
                  name="provincia"
                  required
                  value={provincia}
                  onChange={(e) => {
                    setProvincia(e.target.value);
                    clearError("provincia");
                  }}
                  style={{ ...inp, background: "white" }}
                  className={errorClass("provincia")}
                >
                  <option value="">Selecciona provincia…</option>
                  {PROVINCIAS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          <div className="card" style={{ marginTop: 14, background: "var(--brand-soft)" }}>
            <div style={{ fontWeight: 900 }}>
              {banner.mode === "plantilla"
                ? "Has elegido una plantilla"
                : banner.mode === "digital"
                ? "Has elegido modalidad Digital"
                : "Has elegido diseño exclusivo"}
            </div>

            {/* ✅ Plantilla visible tanto en presencial como en digital */}
            {(banner.mode === "plantilla" || (banner.mode === "digital" && hasTpl && tpl)) && (
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
                <img
                  src={encodeURI(tpl)}
                  alt={prettyTplName(tpl)}
                  style={{
                    width: 120,
                    height: 78,
                    objectFit: "cover",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                  }}
                />
                <div>
                  <div style={{ fontWeight: 900 }}>{prettyTplName(tpl)}</div>
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>{cat ? `Categoría: ${cat}` : ""}</div>
                  <div style={{ marginTop: 8 }}>
                    <a href="/plantillas" className="btnOutline">
                      Cambiar plantilla
                    </a>
                  </div>
                </div>
              </div>
            )}

            {banner.mode === "digital" && !hasTpl && (
              <div style={{ marginTop: 8, color: "var(--muted)" }}>
                Si quieres, puedes elegir una plantilla antes de enviar el presupuesto.
                <div style={{ marginTop: 10 }}>
                  <a href="/plantillas" className="btnOutline">
                    Ver plantillas
                  </a>
                </div>
              </div>
            )}

            {banner.mode !== "plantilla" && banner.mode !== "digital" && (
              <div style={{ marginTop: 8, color: "var(--muted)" }}>
                Perfecto. En comentarios puedes indicar temática, referencias o estilo.
              </div>
            )}
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 900 }}>Nos ocupamos de todo</div>
            <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
              {tipoOrla === "digital" ? (
                <>
                  Retoque fotográfico, maquetación, impresión en alta calidad, formato <b>A3</b>, papel de buen gramaje y{" "}
                  <b>envío nacional</b>. <b>Las fotos las hace el cole</b> y nos las envía.
                </>
              ) : (
                <>
                  Diseño de la orla (si es exclusiva), maquetación, fotografías <i>in situ</i>, retoque fotográfico,
                  impresión en alta calidad, formato <b>A3</b>, papel de buen gramaje y <b>entrega en mano</b>.
                </>
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (status === "sending") return;

                const form = e.currentTarget as HTMLFormElement;
                const formData = new FormData(form);

                const alumnosN = toIntSafe(alumnosStr, 0);
                const contacto = normalizeName(String(formData.get("contacto") || ""));
                const email = normalizeEmail(String(formData.get("email") || ""));
                const telefonoRaw = String(formData.get("telefono") || "").trim();

                const nextErrors: Errors = {};
                if (!provincia) nextErrors.provincia = "Selecciona una provincia.";
                if (!contacto) nextErrors.contacto = "El nombre es obligatorio.";
                if (!email) nextErrors.email = "El email es obligatorio.";
                else if (!isValidEmail(email)) nextErrors.email = "Email no válido.";
                if (!telefonoRaw) nextErrors.telefono = "El teléfono es obligatorio.";
                else if (!isValidPhoneES(telefonoRaw)) nextErrors.telefono = "El teléfono debe tener 9 dígitos.";
                if (alumnosN <= 0) nextErrors.alumnos = "Indica el número de alumnos.";

                if (Object.keys(nextErrors).length > 0) {
                  setErrors(nextErrors);
                  setFormMsg("Tienes campos sin rellenar o con formato incorrecto. Revisa los marcados en rojo.");
                  return;
                }

                setStatus("sending");
                setFormMsg("");
                setErrors({});

                const telefonoWa = normalizePhoneForWhatsApp(telefonoRaw);

                const payload = {
                  centro: String(formData.get("colegio") || "").trim(),
                  contacto_nombre: contacto,
                  contacto_email: email,
                  contacto_telefono: telefonoRaw,
                  contacto_telefono_wa: telefonoWa,

                  provincia: provincia,
                  ciudad: String(formData.get("ciudad") || "").trim(),

                  fecha_evento: String(formData.get("fechas") || "").trim(),
                  curso: String(formData.get("curso") || "").trim(),
                  comentarios: String(formData.get("comentarios") || "").trim(),

                  estado: estado,
                  tipo_orla: tipoOrla,
                  alumnos: alumnosN,

                  precios: {
                    unitario: calc.unitBase,
                    envio: calc.envioSinIva,
                    iva_pct: calc.ivaPct,
                    subtotal_sin_iva: calc.subtotalSinIva,
                    total_con_iva: calc.totalConIva,
                  },

                  extras: {
                    beca_graduacion: extraBeca,
                    taza: extraTaza,
                    sobre_reforzado: extraSobre,
                    fotos_recuerdo: extraFotosRecuerdo,
                  },

                  // ✅ plantilla se envía también en digital (si existe)
                  plantilla_url: tpl || "",
                  categoria_plantilla: cat || "",
                };

                try {
                  const res = await fetch(
                    "https://script.google.com/macros/s/AKfycbwkkmSTfZhW3kkVFnXwLz_LXx0VR2DIwvPzt52bl9Z1bjZhXAaT0V5YWGKOCI30J6o6jA/exec",
                    {
                      method: "POST",
                      headers: { "Content-Type": "text/plain;charset=utf-8" },
                      body: JSON.stringify(payload),
                    }
                  );

                  if (res.ok) {
                    setStatus("sent");
                    setErrors({});
                    setFormMsg("");
                    form.reset();
                    setEstado("informativo");
                    setExtraBeca(false);
                    setExtraTaza(false);
                    setExtraSobre(false);
                    setExtraFotosRecuerdo(false);
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
              {formMsg && <div style={formMsgBox}>{formMsg}</div>}

              <Field label="Centro / Colegio (opcional)">
                <input name="colegio" placeholder="Nombre del centro" style={inp} />
              </Field>

              <Field label="Curso / Grupo (opcional)">
                <input name="curso" placeholder="Ej: 6º Primaria / 2º Bach" style={inp} />
              </Field>

              <Field label="Número de alumnos *">
                <input
                  name="alumnos"
                  required
                  inputMode="numeric"
                  type="number"
                  min={1}
                  step={1}
                  placeholder="Ej: 45"
                  style={inp}
                  className={errorClass("alumnos")}
                  value={alumnosStr}
                  onChange={(e) => {
                    setAlumnosStr(e.target.value);
                    clearError("alumnos");
                  }}
                />
              </Field>

              {errors.provincia ? <div style={errInline}>⚠️ {errors.provincia}</div> : null}

              <Field label="Ciudad (opcional)">
                <input name="ciudad" placeholder="Ej: Móstoles / Talavera / Valencia" style={inp} />
              </Field>

              <Field label={tipoOrla === "digital" ? "Fechas orientativas (opcional)" : "Fechas orientativas para las fotos (opcional)"}>
                <input
                  name="fechas"
                  placeholder={tipoOrla === "digital" ? "Ej: Semana del 10–20 marzo" : "Ej: 10–20 marzo"}
                  style={inp}
                />
              </Field>

              <Field label="Nombre y apellidos *">
                <input
                  name="contacto"
                  required
                  placeholder="Nombre y apellidos"
                  style={inp}
                  className={errorClass("contacto")}
                  onChange={() => clearError("contacto")}
                />
              </Field>

              <Field label="Teléfono *">
                <input
                  name="telefono"
                  required
                  placeholder="Ej: 6XX XXX XXX"
                  style={inp}
                  className={errorClass("telefono")}
                  onChange={() => clearError("telefono")}
                />
              </Field>

              <Field label="Email *">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="tu@email.com"
                  style={inp}
                  className={errorClass("email")}
                  onChange={() => clearError("email")}
                />
              </Field>

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

                <label style={checkRow}>
                  <input
                    type="checkbox"
                    checked={extraFotosRecuerdo}
                    onChange={(e) => setExtraFotosRecuerdo(e.target.checked)}
                  />
                  <span className="tipWrap">
                    <span>
                      Fotos de recuerdo — <b>4,50 €</b> / alumno
                    </span>
                    <span className="tipIcon" aria-label="Más info" title="Más info">
                      i
                    </span>
                    <span className="tipBox">
                      Pack de fotos individuales para las familias (ideal como recuerdo).
                      <br />
                      <b>Se calcula por alumno</b>.
                    </span>
                  </span>
                </label>
              </div>

              <div className="card" style={{ background: "white", border: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>Resumen</div>
                <div style={{ display: "grid", gap: 6, color: "var(--muted)" }}>
                  <div>
                    Modalidad: <b style={{ color: "var(--text)" }}>{tipoOrla === "digital" ? "Digital" : tipoOrla}</b>
                  </div>
                  <div>
                    Precio unitario: <b style={{ color: "var(--text)" }}>{calc.unitBase.toFixed(2)} €</b> / alumno
                  </div>
                  {calc.envioSinIva > 0 && (
                    <div>
                      Logística nacional: <b style={{ color: "var(--text)" }}>{calc.envioSinIva.toFixed(2)} €</b> / pedido
                    </div>
                  )}
                  <div>
                    Subtotal (sin IVA): <b style={{ color: "var(--text)" }}>{calc.subtotalSinIva.toFixed(2)} €</b>
                  </div>
                  <div>
                    IVA ({calc.ivaPct}%): <b style={{ color: "var(--text)" }}>{calc.iva.toFixed(2)} €</b>
                  </div>
                  <div style={{ fontSize: 16 }}>
                    Total: <b style={{ color: "var(--brand-hover)" }}>{calc.totalConIva.toFixed(2)} €</b>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btnPrimary"
                disabled={status === "sending"}
                style={{ opacity: status === "sending" ? 0.75 : 1 }}
              >
                {status === "sending" ? "Enviando..." : "Enviar presupuesto"}
              </button>

              {status === "sent" && <div style={okBox}>✅ Enviado. Te llegará por email con validez 15 días.</div>}
              {status === "error" && <div style={errBox}>❌ No se pudo enviar. Revisa los datos o escribe por WhatsApp.</div>}
            </form>
          </div>

          <div style={{ marginTop: 14 }}>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--brand-hover)", fontWeight: 900, textDecoration: "none" }}
            >
              💬 Si prefieres, escribe directamente por WhatsApp
            </a>
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
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

const formMsgBox: React.CSSProperties = {
  padding: 12,
  borderRadius: 12,
  background: "#fff7ed",
  border: "1px solid #fed7aa",
  color: "#9a3412",
  fontWeight: 900,
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

const errInline: React.CSSProperties = {
  marginTop: -6,
  marginBottom: 6,
  padding: "10px 12px",
  borderRadius: 12,
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#7f1d1d",
  fontWeight: 900,
};

const checkRow: React.CSSProperties = { display: "flex", gap: 10, alignItems: "center", padding: "6px 0" };

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

const choiceCard: React.CSSProperties = {
  background: "white",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 16,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const choiceHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "baseline",
};

const choicePrice: React.CSSProperties = {
  fontWeight: 900,
  color: "var(--brand-hover)",
  whiteSpace: "nowrap",
};
