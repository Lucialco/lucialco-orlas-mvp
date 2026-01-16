import PlantillasClient from "../plantillas/PlantillasClient";

const SITE_URL = "https://orlas.lucialco.es";

export const metadata = {
  title: "Plantillas de Orlas Infantiles y Guardería | Diseños Cuidados | Lucialco",
  description:
    "Plantillas de orlas para guardería e infantil, con estilos alegres y delicados. Proceso fácil para el centro y entrega lista para imprimir. Pide presupuesto.",
};

type Plantilla = { src: string; title: string };
type PlantillasData = Record<string, Plantilla[]>;

async function getPlantillas(): Promise<PlantillasData> {
  const mod = await import("../../data/plantillas.json");
  return (mod.default ?? mod) as PlantillasData;
}

function jsonLd() {
  const pageUrl = `${SITE_URL}/plantillas-infantil`;

  const collectionPage = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}/#collection`,
    name: "Plantillas de orlas para guardería e infantil",
    description: "Selección de plantillas de orlas para guardería e infantil.",
    url: pageUrl,
  };

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}/#service`,
    name: "Diseño de orlas para guardería e infantil",
    description:
      "Servicio de diseño de orlas para guardería e infantil usando plantillas como base, con acompañamiento y entrega lista para imprimir.",
    provider: { "@type": "LocalBusiness", name: "Lucialco", url: SITE_URL },
    areaServed: { "@type": "Country", name: "España" },
    url: pageUrl,
  };

  const offerCatalog = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "@id": `${pageUrl}/#catalog`,
    name: "Plantillas guardería / infantil",
    url: pageUrl,
  };

  return [collectionPage, service, offerCatalog];
}

export default async function Page() {
  const data = await getPlantillas();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
      />
      <PlantillasClient data={data} onlyGroup="GI" />
    </>
  );
}
