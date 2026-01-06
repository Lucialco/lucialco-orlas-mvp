import { Suspense } from "react";
import HomeClient from "./HomeClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24, fontFamily: "Arial" }}>Cargando…</div>}>
      <HomeClient />
    </Suspense>
  );
}
