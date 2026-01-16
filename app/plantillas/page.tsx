import PlantillasClient from "./PlantillasClient";

const SITE_URL = "https://orlas.lucialco.es";

export const metadata = {
  title: "Plantillas de Orlas Escolares | Guardería, Infantil, Primaria y Secundaria",
  description:
    "Explora plantillas de orlas escolares y elige el estilo para tu clase. Diseño cuidado, gestión sencilla de fotos y entrega final lista para imprimir. Solicita presupuesto.",
};

type Plantilla = { src: string; title: string };
type PlantillasData = Record<string, Plantilla[]>;

async function getPlantillas(): Promise<PlantillasData> {
  const mod = await import("../../data/plantillas.json");
  return (mod.default ?? mod) as PlantillasData;
}

function jsonLd() {
  const pageUrl = `${SITE_URL}/plantillas`;

  const collectionPage = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}/#collection`,
    name: "Plantillas de orlas escolares",
    description:
      "Catálogo de plantillas de orlas escolares agrupadas por etapa: guardería/infantil y primaria/secundaria.",
    url: pageUrl,
  };

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}/#service`,
    name: "Plantillas de orlas escolares (selección de base)",
    description:
      "Selección de plantillas como base para orlas escolares, con acompañamiento y entrega final lista para imprimir.",
    provider: { "@type": "LocalBusiness", name: "Lucialco", url: SITE_URL },
    areaServed: { "@type": "Country", name: "España" },
    url: pageUrl,
  };

  const offerCatalog = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "@id": `${pageUrl}/#catalog`,
    name: "Catálogo de plantillas por etapa",
    url: pageUrl,
    itemListElement: [
      {
        "@type": "OfferCatalog",
        name: "Guardería / Infantil",
        url: `${SITE_URL}/plantillas-infantil`,
      },
      {
        "@type": "OfferCatalog",
        name: "Primaria / Secundaria",
        url: `${SITE_URL}/plantillas-primaria-secundaria`,
      },
    ],
  };

  return [collectionPage, service, offerCatalog];
}

export default async function PlantillasPage() {
  const data = await getPlantillas();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
      />
      <PlantillasClient data={data} />
    </>
  );
}
