"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const LUCIA_PHONE_E164 = "34606849914";
const WHATSAPP_LINK = `https://wa.me/${LUCIA_PHONE_E164}`;

const LS_PROVINCIA = "lucialco_orlas_provincia";
const LS_MODALIDAD = "lucialco_orlas_modalidad";

const PROVINCIAS = [
  "Álava","Albacete","Alicante","Almería","Asturias","Ávila","Badajoz","Barcelona","Burgos","Cáceres","Cádiz","Cantabria",
  "Castellón","Ciudad Real","Córdoba","Cuenca","Gerona","Granada","Guadalajara","Guipúzcoa","Huelva","Huesca","Islas Baleares",
  "Jaén","La Coruña","La Rioja","Las Palmas","León","Lérida","Lugo","Madrid","Málaga","Murcia","Navarra","Orense","Palencia",
  "Pontevedra","Salamanca","Santa Cruz de Tenerife","Segovia","Sevilla","Soria","Tarragona","Teruel","Toledo","Valencia",
  "Valladolid","Vizcaya","Zamora","Zaragoza",
] as const;

const PRICE = {
  local_plantilla: 11.5,
  local_exclusiva: 15,
  digital_plantilla: 9,
  digital_exclusiva: 10.5,
  envio_nacional: 15,

  extra_beca: 7.5,
  extra_taza: 9.5,
  extra_sobre: 3,
  extra_fotos_recuerdo: 4.5,

  iva_pct: 21,
} as const;

const EXTRAS_DISCLAIMER =
  "Nota: el precio de los extras es orientativo y está pendiente de confirmar detalles de acabados (por ejemplo, impresión y tonos de color).";

type Status = "idle" | "sending" | "sent" | "error";
type EstadoPresupuesto = "informativo" | "interesado";
type ModalidadOrla = "local_plantilla" | "local_exclusiva" | "digital_plantilla" | "digital_exclusiva";

type FieldKey = "contacto" | "email" | "telefono" | "alumnos" | "provincia" | "plantilla" | "cupon";
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
function eur(n: number) {
  return `${n.toFixed(2)} €`;
}
function normalizeCoupon(code: string) {
  return String(code || "").trim().toUpperCase();
}

type QuoteResponse = {
  alumnos: number;
  modalidad: ModalidadOrla;
  unitBase: number;
  baseSinIva: number;
  extrasSinIva: number;
  envioSinIva: number;
  subtotalSinIva: number;

  couponProvided: boolean;
  couponValid: boolean;
  couponApplied: string | null;
  discountSinIva: number;
  subtotalConDescuentoSinIva: number;

  ivaPct: number;
  iva: number;
  totalConIva: number;
};

export default function PresupuestoClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const tplOld = sp.get("tpl") || "";
  const catOld = sp.get("cat") || "";
  const tplNew = sp.get("plantilla_url") || "";
  const catNew = sp.get("categoria_plantilla") || "";
  const tpl = tplOld || tplNew;
  const cat = catOld || catNew;

  const tipoQS = (sp.get("tipo") || "").toLowerCase();

  const [provincia, setProvincia] = useState<string>("");
  const esLocal = useMemo(() => isLocalProvincia(provincia), [provincia]);
  const provinciaOk = !!provincia;

  const [modalidad, setModalidad] = useState<ModalidadOrla | null>(null);

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

  const [couponCode, setCouponCode] = useState("");
  const couponNorm = useMemo(() => normalizeCoupon(couponCode), [couponCode]);

  const isDigital = modalidad?.startsWith("digital") ?? false;

  // ✅ quote server-side
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [couponInvalid, setCouponInvalid] = useState(false);

  useEffect(() => {
    try {
      const p = localStorage.getItem(LS_PROVINCIA) || "";
      const m = (localStorage.getItem(LS_MODALIDAD) || "") as ModalidadOrla | "";
      if (p) setProvincia(p);
      if (m) setModalidad(m || null);
    } catch {}
  }, []);

  useEffect(() => {
    if (modalidad) return;
    if (tipoQS === "adhoc") setModalidad("local_exclusiva");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoQS]);

  useEffect(() => {
    if (!tpl) return;
    if (!provinciaOk) return;
    if (modalidad) return;
    setModalidad(esLocal ? "local_plantilla" : "digital_plantilla");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tpl, provinciaOk, esLocal]);

  useEffect(() => {
    try {
      if (provincia) localStorage.setItem(LS_PROVINCIA, provincia);
    } catch {}
  }, [provincia]);

  useEffect(() => {
    try {
      if (modalidad) localStorage.setItem(LS_MODALIDAD, modalidad);
    } catch {}
  }, [modalidad]);

  useEffect(() => {
    if (!provinciaOk) return;

    if (esLocal) {
      if (modalidad?.startsWith("digital")) setModalidad(null);
    } else {
      if (modalidad?.startsWith("local")) setModalidad(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinciaOk, esLocal]);

  // ✅ Extras detalle SOLO para mostrar líneas (el total lo da el servidor)
  const extrasDetalle = useMemo(() => {
    const qty = alumnos > 0 ? alumnos : 0;
    const lines = [
      extraBeca ? { key: "beca", label: "Beca de graduación personalizada (cole)", unit: PRICE.extra_beca, qty, total: qty * PRICE.extra_beca } : null,
      extraTaza ? { key: "taza", label: "Taza con foto", unit: PRICE.extra_taza, qty, total: qty * PRICE.extra_taza } : null,
      extraSobre ? { key: "sobre", label: "Sobres reforzados con nombre", unit: PRICE.extra_sobre, qty, total: qty * PRICE.extra_sobre } : null,
      extraFotosRecuerdo ? { key: "fotos", label: "Fotos de recuerdo", unit: PRICE.extra_fotos_recuerdo, qty, total: qty * PRICE.extra_fotos_recuerdo } : null,
    ].filter(Boolean) as Array<{ key: string; label: string; unit: number; qty: number; total: number }>;

    return lines.map((l) => ({ ...l, unit: round2(l.unit), total: round2(l.total) }));
  }, [extraBeca, extraTaza, extraSobre, extraFotosRecuerdo, alumnos]);

  const hayExtras = extrasDetalle.length > 0;

  // ✅ Fetch quote (debounced)
  useEffect(() => {
    const canQuote = !!modalidad && alumnos > 0;
    if (!canQuote) {
      setQuote(null);
      setCouponInvalid(false);
      return;
    }

    const ac = new AbortController();
    const t = setTimeout(async () => {
      setQuoteLoading(true);
      setCouponInvalid(false);

      try {
        const res = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ac.signal,
          body: JSON.stringify({
            alumnos,
            modalidad,
            couponCode: couponNorm,
            extras: {
              beca_graduacion: extraBeca,
              taza: extraTaza,
              sobre_reforzado: extraSobre,
              fotos_recuerdo: extraFotosRecuerdo,
            },
          }),
        });

        if (!res.ok) throw new Error("quote_error");
        const data = (await res.json()) as QuoteResponse;

        setQuote(data);
        setCouponInvalid(!!couponNorm && data.couponProvided && !data.couponValid);
      } catch {
        if (!ac.signal.aborted) {
          setQuote(null);
          setCouponInvalid(false);
        }
      } finally {
        if (!ac.signal.aborted) setQuoteLoading(false);
      }
    }, 250);

    return () => {
      ac.abort();
      clearTimeout(t);
    };
  }, [alumnos, modalidad, extraBeca, extraTaza, extraSobre, extraFotosRecuerdo, couponNorm]);

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

  const equalBtn: React.CSSProperties = {
    width: "100%",
    minHeight: 46,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const goPlantillas = () => router.push("/plantillas");

  const modalidadLabel = useMemo(() => {
    if (!modalidad) return "";
    switch (modalidad) {
      case "local_plantilla": return "Presencial · Plantilla";
      case "local_exclusiva": return "Presencial · Exclusiva";
      case "digital_plantilla": return "Digital · Plantilla";
      case "digital_exclusiva": return "Digital · Exclusiva";
    }
  }, [modalidad]);

  const requierePlantilla = !!modalidad && modalidad.endsWith("plantilla");
  const faltaPlantilla = requierePlantilla && !tpl;

  const ProvinciaCard = (
    <div className="card" style={{ marginTop: 14, background: "var(--brand-soft)" }}>
      <div style={{ fontWeight: 900 }}>Provincia del centro *</div>
      <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
        {provinciaOk
          ? esLocal
            ? "Madrid/Toledo: servicio presencial (Lucía hace las fotos)."
            : "Resto de España: servicio digital (las fotos las hace el cole y nos las envía)."
          : "Selecciona la provincia para mostrarte las opciones."}
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
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );

  const ChoiceCard = (
    <div className="card" style={{ marginTop: 14, background: "var(--brand-soft)" }}>
      {esLocal ? (
        <>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Elige el tipo de orla (Presencial)</div>
          <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
            Incluye fotos <i>in situ</i>, retoque, maquetación e impresión A3 en alta calidad (entrega en mano).
          </div>

          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 14 }}>
            <div style={choiceCard}>
              <div>
                <div style={choiceHeader}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>Orla desde plantilla</div>
                  <div style={choicePrice}>{PRICE.local_plantilla.toFixed(2)} € / niñ@</div>
                </div>
                <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
                  Eliges una plantilla y la adaptamos a tu centro (nombres, logos, composición y revisión final).
                </div>
              </div>
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                <button
                  type="button"
                  className="btnPrimary"
                  style={equalBtn}
                  onClick={() => { setModalidad("local_plantilla"); goPlantillas(); }}
                >
                  Ver plantillas
                </button>
              </div>
            </div>

            <div style={choiceCard}>
              <div>
                <div style={choiceHeader}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>Orla con diseño exclusivo</div>
                  <div style={choicePrice}>{PRICE.local_exclusiva.toFixed(2)} € / niñ@</div>
                </div>
                <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
                  Diseñamos una orla única desde cero según temática/estilo.
                </div>
              </div>
              <div style={{ marginTop: 12, display: "grid" }}>
                <button type="button" className="btnPrimary" style={equalBtn} onClick={() => setModalidad("local_exclusiva")}>
                  Quiero exclusiva
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Elige el tipo de orla (Digital)</div>
          <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
            En tu provincia trabajamos en <b>modo digital</b>: <b>las fotos las hace el cole</b> y nos las envía. Lucía hace el{" "}
            <b>retoque</b>, la <b>maquetación</b> y la <b>impresión A3</b>.
            <br />
            <b>Transporte (aprox.): +{PRICE.envio_nacional} €</b> por pedido.
          </div>

          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 14 }}>
            <div style={choiceCard}>
              <div>
                <div style={choiceHeader}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>Digital desde plantilla</div>
                  <div style={choicePrice}>{PRICE.digital_plantilla.toFixed(2)} € / niñ@</div>
                </div>
                <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
                  Eliges una plantilla y la adaptamos a tu centro. (Fotos las hace el cole).
                </div>
              </div>
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                <button
                  type="button"
                  className="btnPrimary"
                  style={equalBtn}
                  onClick={() => { setModalidad("digital_plantilla"); goPlantillas(); }}
                >
                  Ver plantillas
                </button>
                <button type="button" className="btnOutline" style={equalBtn} onClick={() => setModalidad("digital_plantilla")}>
                  Continuar
                </button>
              </div>
            </div>

            <div style={choiceCard}>
              <div>
                <div style={choiceHeader}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>Digital con diseño exclusivo</div>
                  <div style={choicePrice}>{PRICE.digital_exclusiva.toFixed(2)} € / niñ@</div>
                </div>
                <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
                  Diseñamos una orla única desde cero. (Fotos las hace el cole).
                </div>
              </div>
              <div style={{ marginTop: 12, display: "grid" }}>
                <button type="button" className="btnPrimary" style={equalBtn} onClick={() => setModalidad("digital_exclusiva")}>
                  Quiero exclusiva digital
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  

  return (
    <div>
      <style jsx global>{`
        .inputError {
          border: 1px solid #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
        }
        .tipWrap { position: relative; display: inline-flex; align-items: center; gap: 8px; }
        .tipIcon {
          width: 18px; height: 18px; border-radius: 999px; border: 1px solid var(--border);
          display: inline-flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 12px; color: var(--brand-hover);
          background: white; cursor: help; user-select: none;
        }
        .tipBox {
          position: absolute; left: 0; top: 26px; width: min(320px, 78vw);
          background: white; border: 1px solid var(--border); border-radius: 12px;
          padding: 10px 12px; box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
          color: var(--text); line-height: 1.45; font-size: 13px; display: none; z-index: 20;
        }
        .tipWrap:hover .tipBox { display: block; }
      `}</style>

      <div className="badge">Presupuesto · Validez 15 días · IVA 21%</div>

      <h1 style={{ marginTop: 14 }}>Solicitar presupuesto de orla 🎓</h1>
      <p style={{ color: "var(--muted)", lineHeight: 1.5 }}>
        Primero provincia. Luego eliges plantilla o exclusiva según la modalidad disponible.
      </p>

      {ProvinciaCard}

      {!provinciaOk ? null : (
        <>
          {!modalidad ? (
            ChoiceCard
          ) : (
            <>
              <div className="card" style={{ marginTop: 14, background: "var(--brand-soft)" }}>
                <div style={{ fontWeight: 900 }}>Selección</div>
                <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
                  Modalidad: <b style={{ color: "var(--text)" }}>{modalidadLabel}</b>
                  {isDigital && (
                    <>
                      <br />
                      <b>Digital:</b> las fotos las hace el cole y nos las envía. (+{PRICE.envio_nacional} € transporte aprox.)
                    </>
                  )}
                </div>

                {modalidad.endsWith("plantilla") && tpl && (
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={encodeURI(tpl)}
                      alt={prettyTplName(tpl)}
                      style={{ width: 120, height: 78, objectFit: "cover", borderRadius: 12, border: "1px solid var(--border)" }}
                    />
                    <div>
                      <div style={{ fontWeight: 900 }}>{prettyTplName(tpl)}</div>
                      <div style={{ color: "var(--muted)", fontSize: 13 }}>{cat ? `Categoría: ${cat}` : ""}</div>
                      <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button type="button" className="btnOutline" onClick={goPlantillas}>Cambiar plantilla</button>
                        <button type="button" className="btnOutline" onClick={() => setModalidad(null)}>Cambiar modalidad</button>
                      </div>
                    </div>
                  </div>
                )}

                {modalidad.endsWith("plantilla") && !tpl && (
                  <div style={{ marginTop: 12 }}>
                    <div style={warnBox}>
                      ⚠️ Has elegido “plantilla”, pero aún no has seleccionado ninguna. Elige una plantilla para poder enviar el
                      presupuesto.
                    </div>
                    <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button type="button" className="btnPrimary" onClick={goPlantillas}>Ver plantillas</button>
                      <button type="button" className="btnOutline" onClick={() => setModalidad(null)}>Cambiar modalidad</button>
                    </div>
                  </div>
                )}

                {modalidad.endsWith("exclusiva") && (
                  <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button type="button" className="btnOutline" onClick={() => setModalidad(null)}>Cambiar modalidad</button>
                  </div>
                )}
              </div>

              <div className="card" style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 900 }}>Nos ocupamos de todo</div>
                <div style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
                  {isDigital ? (
                    <>
                      Retoque fotográfico, maquetación, impresión en alta calidad, formato <b>A3</b>, papel de buen gramaje y{" "}
                      <b>envío nacional</b>. <b>Las fotos las hace el cole</b> y nos las envía.
                    </>
                  ) : (
                    <>
                      Diseño de la orla (si es exclusiva), maquetación, fotografías <i>in situ</i>, retoque fotográfico, impresión en
                      alta calidad, formato <b>A3</b>, papel de buen gramaje y <b>entrega en mano</b>.
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
                    if (!modalidad) nextErrors.provincia = "Selecciona provincia y modalidad.";
                    if (modalidad?.endsWith("plantilla") && !tpl) nextErrors.plantilla = "Elige una plantilla antes de enviar.";
                    if (!contacto) nextErrors.contacto = "El nombre es obligatorio.";
                    if (!email) nextErrors.email = "El email es obligatorio.";
                    else if (!isValidEmail(email)) nextErrors.email = "Email no válido.";
                    if (!telefonoRaw) nextErrors.telefono = "El teléfono es obligatorio.";
                    else if (!isValidPhoneES(telefonoRaw)) nextErrors.telefono = "El teléfono debe tener 9 dígitos.";
                    if (alumnosN <= 0) nextErrors.alumnos = "Indica el número de alumnos.";

                    if (couponInvalid) nextErrors.cupon = "Cupón no válido.";

                    if (!quote || quoteLoading) {
                      setFormMsg("Calculando el presupuesto… espera un segundo y vuelve a enviar.");
                      return;
                    }

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

                      tipo_orla: modalidad.startsWith("digital") ? "digital" : "presencial",
                      modalidad_orla: modalidad,

                      alumnos: alumnosN,
                      precios: {
                        unitario: quote.unitBase,
                        transporte_aprox: quote.envioSinIva,
                        iva_pct: quote.ivaPct,

                        subtotal_sin_iva: quote.subtotalSinIva,

                        cupon: quote.couponApplied || "",
                        descuento_sin_iva: quote.discountSinIva,
                        subtotal_con_descuento_sin_iva: quote.subtotalConDescuentoSinIva,

                        total_con_iva: quote.totalConIva,

                        nota_extras: hayExtras ? EXTRAS_DISCLAIMER : "",
                      },

                      nota_presupuesto: hayExtras ? EXTRAS_DISCLAIMER : "",

                      extras: {
                        beca_graduacion: extraBeca,
                        taza: extraTaza,
                        sobre_reforzado: extraSobre,
                        fotos_recuerdo: extraFotosRecuerdo,
                      },

                      plantilla_url: tpl || "",
                      categoria_plantilla: cat || "",
                    };

                    try {
                      const res = await fetch(
                        
                        "https://script.google.com/macros/s/AKfycbx-EiGB1FcdRi8AtVJMvDITA0k1I-uOnTjqKbGLkfriGXxReR4Ds954YlOrQ6cCPzAzXA/exec",
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
                        setCouponCode("");
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
                  {errors.plantilla && <div style={warnBox}>⚠️ {errors.plantilla}</div>}

                  <Field label="Provincia">
                    <input value={provincia} readOnly disabled style={{ ...inp, background: "var(--brand-soft)" }} />
                  </Field>

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

                  <Field label="Ciudad">
                    <input name="ciudad" placeholder="Ej: Móstoles / Talavera / Valencia" style={inp} />
                  </Field>

                  <Field label={isDigital ? "Fechas orientativas (opcional)" : "Fechas orientativas para las fotos (opcional)"}>
                    <input name="fechas" placeholder={isDigital ? "Ej: Semana del 10–20 marzo" : "Ej: 10–20 marzo"} style={inp} />
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

                  {/* ✅ CUPÓN */}
                  <Field label="Cupón (opcional)">
                    <input
                      name="cupon"
                      placeholder="Código promocional"
                      style={inp}
                      className={`${errorClass("cupon")} ${couponInvalid ? "inputError" : ""}`}
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        clearError("cupon");
                      }}
                    />
                    {couponInvalid && (
                      <div style={{ marginTop: 8, color: "#7f1d1d", fontWeight: 900 }}>
                        ❌ Cupón no válido.
                      </div>
                    )}
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
                      <span>Beca de graduación personalizada (cole) — <b>{PRICE.extra_beca.toFixed(2)} €</b> / niñ@</span>
                    </label>

                    <label style={checkRow}>
                      <input type="checkbox" checked={extraTaza} onChange={(e) => setExtraTaza(e.target.checked)} />
                      <span>Taza con foto — <b>{PRICE.extra_taza.toFixed(2)} €</b> / niñ@</span>
                    </label>

                    <label style={checkRow}>
                      <input type="checkbox" checked={extraSobre} onChange={(e) => setExtraSobre(e.target.checked)} />
                      <span>Sobres reforzados con nombre — <b>{PRICE.extra_sobre.toFixed(2)} €</b> / niñ@</span>
                    </label>

                    <label style={checkRow}>
                      <input type="checkbox" checked={extraFotosRecuerdo} onChange={(e) => setExtraFotosRecuerdo(e.target.checked)} />
                      <span className="tipWrap">
                        <span>Fotos de recuerdo — <b>{PRICE.extra_fotos_recuerdo.toFixed(2)} €</b> / alumno</span>
                        <span className="tipIcon" aria-label="Más info" title="Más info">i</span>
                        <span className="tipBox">
                          Pack de fotos individuales para las familias (ideal como recuerdo).
                          <br /><b>Se calcula por alumno</b>.
                        </span>
                      </span>
                    </label>
                  </div>

                  <div className="card" style={{ background: "white", border: "1px solid var(--border)" }}>
  <div style={{ fontWeight: 900, marginBottom: 8 }}>Resumen</div>

  <div
    style={{
      marginBottom: 12,
      padding: 12,
      borderRadius: 12,
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      color: "#1e3a8a",
      fontWeight: 700,
      lineHeight: 1.5,
      fontSize: 14,
    }}
  >
    💡 <b>Centros con varias graduaciones</b><br />
    Si vuestro colegio realiza <b>más de una graduación</b> el mismo curso
    (por ejemplo <b>infantil + primaria</b> o <b>infantil + primaria + secundaria</b>),
    podemos <b>revisar el presupuesto global</b> y aplicar condiciones especiales.
  </div>

  {!quote && alumnos > 0 && modalidad && (
                    {!quote && alumnos > 0 && modalidad && (
                      <div style={{ color: "var(--muted)" }}>
                        {quoteLoading ? "Calculando…" : "No se pudo calcular. Revisa conexión."}
                      </div>
                    )}

                    {quote && (
                      <div style={{ display: "grid", gap: 6, color: "var(--muted)" }}>
                        <div>Modalidad: <b style={{ color: "var(--text)" }}>{modalidadLabel}</b></div>
                        <div>Precio unitario: <b style={{ color: "var(--text)" }}>{eur(quote.unitBase)}</b> / alumno</div>

                        {extrasDetalle.length > 0 && (
                          <div style={{ marginTop: 6 }}>
                            <div style={{ fontWeight: 900, color: "var(--text)", marginBottom: 6 }}>Extras</div>
                            <div style={{ display: "grid", gap: 6 }}>
                              {extrasDetalle.map((x) => (
                                <div key={x.key} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                  <div>
                                    <span style={{ color: "var(--text)", fontWeight: 800 }}>{x.label}</span>
                                    <span> — {eur(x.unit)} / alumno · {x.qty} alumno{x.qty === 1 ? "" : "s"}</span>
                                  </div>
                                  <b style={{ color: "var(--text)" }}>{eur(x.total)}</b>
                                </div>
                              ))}
                            </div>
                            <div style={{ marginTop: 10 }}>
                              <div style={noteBox}>ℹ️ {EXTRAS_DISCLAIMER}</div>
                            </div>
                          </div>
                        )}

                        {quote.envioSinIva > 0 && (
                          <div style={{ marginTop: extrasDetalle.length > 0 ? 6 : 0 }}>
                            Transporte (aprox.): <b style={{ color: "var(--text)" }}>{Math.round(quote.envioSinIva)} €</b> / pedido
                          </div>
                        )}

                        <div>Subtotal (sin IVA): <b style={{ color: "var(--text)" }}>{eur(quote.subtotalSinIva)}</b></div>

                        {quote.discountSinIva > 0 && (
                          <>
                            <div>
                              Descuento {quote.couponApplied ? `(${quote.couponApplied})` : ""}:{" "}
                              <b style={{ color: "var(--text)" }}>-{eur(quote.discountSinIva)}</b>
                            </div>
                            <div>
                              Subtotal con descuento (sin IVA):{" "}
                              <b style={{ color: "var(--text)" }}>{eur(quote.subtotalConDescuentoSinIva)}</b>
                            </div>
                          </>
                        )}

                        <div>IVA ({quote.ivaPct}%): <b style={{ color: "var(--text)" }}>{eur(quote.iva)}</b></div>
                        <div style={{ fontSize: 16 }}>
                          Total: <b style={{ color: "var(--brand-hover)" }}>{eur(quote.totalConIva)}</b>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btnPrimary"
                    disabled={status === "sending" || faltaPlantilla || quoteLoading || !quote}
                    style={{ opacity: status === "sending" || faltaPlantilla || quoteLoading || !quote ? 0.75 : 1 }}
                  >
                    {status === "sending"
                      ? "Enviando..."
                      : faltaPlantilla
                      ? "Elige una plantilla para continuar"
                      : quoteLoading || !quote
                      ? "Calculando presupuesto…"
                      : "Enviar presupuesto"}
                  </button>

                  {status === "sent" && (
  <div style={okBox}>
    ✅ Presupuesto enviado. Te llegará por email con validez 15 días.

    <div style={{ marginTop: 10, fontWeight: 600, lineHeight: 1.5 }}>
      💡 Si vuestro centro realiza <b>más de una graduación</b> el mismo año
      (por ejemplo <b>infantil + primaria</b> o <b>infantil + primaria + secundaria</b>),
      podemos <b>revisar el precio del conjunto</b> y aplicar condiciones especiales.
    </div>
  </div>
)}
                  {status === "error" && <div style={errBox}>❌ No se pudo enviar. Revisa los datos o escribe por WhatsApp.</div>}
                </form>
              </div>

              <div style={{ marginTop: 14 }}>
                <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" style={{ color: "var(--brand-hover)", fontWeight: 900, textDecoration: "none" }}>
                  💬 Si prefieres, escribe directamente por WhatsApp
                </a>
              </div>
            </>
          )}
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

const warnBox: React.CSSProperties = {
  marginTop: 10,
  padding: 12,
  borderRadius: 12,
  background: "#fff7ed",
  border: "1px solid #fed7aa",
  color: "#9a3412",
  fontWeight: 900,
};

const noteBox: React.CSSProperties = {
  padding: 12,
  borderRadius: 12,
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  color: "#1e3a8a",
  fontWeight: 800,
  lineHeight: 1.5,
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
