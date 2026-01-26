import { Suspense } from "react";
import HomeClient from "./HomeClient";

const SITE_URL = "https://orlas.lucialco.es";

export const metadata = {
  title: "Orlas Escolares Personalizadas | Diseño Cuidado para Colegios | Lucialco",
  description:
    "Diseño de orlas escolares personalizadas para guardería, infantil, primaria y secundaria. Proceso fácil para el centro, acompañamiento y entrega lista para imprimir. Pide presupuesto.",
};

function jsonLd() {
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: "Lucialco",
    url: SITE_URL,
    areaServed: "ES",
  };

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/#service`,
    name: "Diseño de orlas escolares personalizadas",
    description:
      "Servicio de diseño y creación de orlas escolares personalizadas para guardería, infantil, primaria y secundaria, con acompañamiento en todo el proceso y entrega lista para imprimir.",
    provider: { "@id": `${SITE_URL}/#localbusiness` },
    areaServed: { "@type": "Country", name: "España" },
    serviceType: "Diseño gráfico educativo",
    url: SITE_URL,
  };

  return [localBusiness, service];
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />
      <Suspense fallback={<div style={{ padding: 24, fontFamily: "Arial" }}>Cargando…</div>}>
        <HomeClient />
      </Suspense>
    </>
  );
}
