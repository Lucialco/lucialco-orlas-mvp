import { Suspense } from "react";
import PresupuestoClient from "./PresupuestoClient";

export const dynamic = "force-dynamic";

export default function PresupuestoPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, fontFamily: "Arial" }}>Cargando…</div>}>
      <PresupuestoClient />
    </Suspense>
  );
}

