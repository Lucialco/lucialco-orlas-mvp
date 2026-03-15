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

type ModalidadOrla =
  | "local_plantilla"
  | "local_exclusiva"
  | "digital_plantilla"
  | "digital_exclusiva";

export default function PresupuestoClient() {

  const router = useRouter();
  const sp = useSearchParams();

  const tplOld = sp.get("tpl") || "";
  const catOld = sp.get("cat") || "";
  const tplNew = sp.get("plantilla_url") || "";
  const catNew = sp.get("categoria_plantilla") || "";

  const tpl = tplOld || tplNew;
  const cat = catOld || catNew;

  const [provincia, setProvincia] = useState("");
  const [modalidad, setModalidad] = useState<ModalidadOrla | null>(null);

  const esLocal = provincia === "Madrid" || provincia === "Toledo";

  const provinciaOk = !!provincia;

  const goPlantillas = () => router.push("/plantillas");

  return (

    <div>

      <div className="badge">
        Presupuesto · Validez 15 días · IVA 21%
      </div>

      <h1 style={{ marginTop: 14 }}>
        Solicitar presupuesto de orla 🎓
      </h1>

      {/* BLOQUE COMERCIAL NUEVO */}

      <div
        style={{
          background: "#f5f7fb",
          padding: "16px",
          borderRadius: "10px",
          marginTop: "10px",
          marginBottom: "10px",
          fontSize: "14px",
          lineHeight: "1.6",
        }}
      >
        <b>Graduaciones múltiples</b><br />

        Muchos colegios realizan varias graduaciones el mismo curso
        (por ejemplo infantil, primaria o secundaria).

        Si vuestro centro prepara varias orlas, podéis pedir presupuesto
        para una o para varias promociones.

        Si finalmente se realizan varias con nosotros,
        podemos valorar condiciones especiales para el conjunto.

        <br /><br />

        💡 Si lo necesitáis podéis comentarlo internamente en el centro
        antes de solicitar el presupuesto definitivo.
      </div>

      <p style={{ color: "var(--muted)", lineHeight: 1.5 }}>
        Primero provincia. Luego eliges plantilla o exclusiva según la modalidad disponible.
      </p>


      {/* PROVINCIA */}

      <div className="card" style={{ marginTop: 14, background: "var(--brand-soft)" }}>

        <div style={{ fontWeight: 900 }}>
          Provincia del centro *
        </div>

        <div style={{ marginTop: 8, color: "var(--muted)" }}>
          {provinciaOk
            ? esLocal
              ? "Madrid/Toledo: servicio presencial (Lucía hace las fotos)."
              : "Resto de España: servicio digital (las fotos las hace el cole y nos las envía)."
            : "Selecciona la provincia para mostrarte las opciones."}
        </div>

        <div style={{ marginTop: 12 }}>

          <select
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              width: "100%"
            }}
          >

            <option value="">Selecciona provincia…</option>

            {PROVINCIAS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}

          </select>

        </div>

      </div>


      {/* ELECCIÓN DE ORLA */}

      {provinciaOk && !modalidad && (

        <div className="card" style={{ marginTop: 14, background: "var(--brand-soft)" }}>

          <div style={{ fontWeight: 900 }}>
            Elige el tipo de orla
          </div>

          <div style={{ marginTop: 10 }}>

            {esLocal ? (

              <>
                <button
                  className="btnPrimary"
                  style={{ marginRight: 10 }}
                  onClick={() => {
                    setModalidad("local_plantilla");
                    goPlantillas();
                  }}
                >
                  Presencial con plantilla
                </button>

                <button
                  className="btnPrimary"
                  onClick={() => setModalidad("local_exclusiva")}
                >
                  Diseño exclusivo
                </button>
              </>

            ) : (

              <>
                <button
                  className="btnPrimary"
                  style={{ marginRight: 10 }}
                  onClick={() => {
                    setModalidad("digital_plantilla");
                    goPlantillas();
                  }}
                >
                  Digital con plantilla
                </button>

                <button
                  className="btnPrimary"
                  onClick={() => setModalidad("digital_exclusiva")}
                >
                  Digital exclusiva
                </button>
              </>

            )}

          </div>

        </div>

      )}


      {/* PLANTILLA SELECCIONADA */}

      {modalidad?.endsWith("plantilla") && tpl && (

        <div className="card" style={{ marginTop: 14 }}>

          <div style={{ fontWeight: 900 }}>
            Plantilla seleccionada
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 12 }}>

            <img
              src={encodeURI(tpl)}
              style={{
                width: 120,
                borderRadius: 10
              }}
            />

            <div>

              <div style={{ fontWeight: 900 }}>
                {decodeURIComponent(tpl.split("/").pop() || "")}
              </div>

              <div style={{ color: "var(--muted)" }}>
                {cat}
              </div>

              <button
                className="btnOutline"
                style={{ marginTop: 8 }}
                onClick={goPlantillas}
              >
                Cambiar plantilla
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

