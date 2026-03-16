import { Suspense } from "react";
import Script from "next/script";
import PresupuestoClient from "./PresupuestoClient";

export const dynamic = "force-dynamic";

export default function PresupuestoPage() {
  return (
    <>
      {/* Google Ads Conversion Event */}
      <Script id="google-ads-conversion" strategy="afterInteractive">
        {`
          gtag('event', 'conversion', {
            'send_to': 'AW-992205118/l7k7CMb90oIYEL6yj9kD'
          });
        `}
      </Script>

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
