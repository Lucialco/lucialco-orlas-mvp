"use client";

import Link from "next/link";

const LUCIA_IG = "https://www.instagram.com/"; // 👈 cambia cuando me des el @

export default function LuciaClient() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="badge">Lucía · Diseños con cariño (y con método)</div>

      <h1 style={{ marginTop: 4, lineHeight: 1.05 }}>Hola, soy Lucía 👋</h1>

      <div className="card" style={{ background: "var(--brand-soft)" }}>
        <p style={{ margin: 0, lineHeight: 1.7 }}>
          Lucialco nace de algo sencillo: convertir un cierre de etapa en un recuerdo bonito, cuidado y fácil de
          gestionar para el cole. Me encargo personalmente del diseño y del acompañamiento para que todo salga
          redondo: tiempos, estilo, fotos y resultado final.
        </p>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Cómo trabajo</h2>

        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          <Step
            n="1"
            title="Nos dices lo básico"
            desc="Curso, nº de alumnos, fechas aproximadas y si queréis plantilla o diseño exclusivo."
          />
          <Step
            n="2"
            title="Te propongo un estilo claro"
            desc="Si es plantilla, elegís. Si es exclusivo, definimos temática y referencias (sin complicaros)."
          />
          <Step
            n="3"
            title="Cierro el diseño y lo dejo listo"
            desc="Ajustes, orden, coherencia visual y detalle final para que quede profesional."
          />
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Lo que puedes esperar</h2>
        <ul style={{ marginTop: 10, lineHeight: 1.85 }}>
          <li>Trato directo conmigo (sin centralitas, sin vueltas).</li>
          <li>Diseño cuidado: limpio, bonito y con sentido.</li>
          <li>Proceso simple: te guío y te marco los siguientes pasos.</li>
          <li>Rapidez cuando hace falta (porque el calendario escolar no perdona).</li>
        </ul>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>¿Empezamos?</h2>
        <p style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.6 }}>
          Si ya lo tienes claro, pide presupuesto. Si quieres inspiración, mira plantillas.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <Link href="/plantillas" className="btnOutline">
            Ver plantillas
          </Link>
          <Link href="/presupuesto" className="btnPrimary">
            Solicitar presupuesto
          </Link>
          <a href={LUCIA_IG} className="btnOutline" target="_blank" rel="noreferrer">
            Ver Instagram
          </a>
        </div>

        <p style={{ marginTop: 12, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
          Consejo rápido: si vais justos de tiempo, elegid una plantilla y lo cerramos rápido. Si queréis algo único,
          hacemos diseño a medida.
        </p>
      </div>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "34px 1fr",
        gap: 10,
        alignItems: "start",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 999,
          background: "var(--brand-soft)",
          border: "1px solid var(--border)",
          color: "var(--brand-hover)",
          fontWeight: 900,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {n}
      </div>

      <div>
        <div style={{ fontWeight: 900 }}>{title}</div>
        <div style={{ color: "var(--muted)", marginTop: 2, lineHeight: 1.55 }}>{desc}</div>
      </div>
    </div>
  );
}
