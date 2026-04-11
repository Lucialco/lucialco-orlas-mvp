import { Suspense } from "react";
import PresupuestoClient from "./PresupuestoClient";

export const dynamic = "force-dynamic";
export const metadata = {
  alternates: {
    canonical: "https://orlas.lucialco.es/presupuesto",
  },
};

export default function PresupuestoPage() {
  return (
    <>
      <Suspense
        fallback={
          <div style={{ padding: 24, fontFamily: "Arial" }}>
            Cargando…
          </div>
        }
      >
        <PresupuestoClient />
      </Suspense>
    </>
  );
}
