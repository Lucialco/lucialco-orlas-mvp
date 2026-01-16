import PlantillasClient from "../plantillas/PlantillasClient";

const SITE_URL = "https://orlas.lucialco.es";
const MAX_ITEMS = 80;

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

function toAbsUrl(src: string) {
  if (!src) return src;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/")) return `${SITE_URL}${src}`;
  return `${SITE_URL}/${src}`;
}

function jsonLd(data: PlantillasData) {
  const pageUrl = `${SITE_URL}/plantillas-infantil`;
  const gi = [...(data["Guarderia"] ?? []), ...(data["Infantil"] ?? [])].slice(0, MAX_ITEMS);

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

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${pageUrl}/#items`,
    name: "Listado de plantillas (guardería / infantil)",
    url: pageUrl,
    numberOfItems: gi.length,
    itemListOrder: "https://schema.org/ItemListUnordered",
    itemListElement: gi.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "CreativeWork",
        name: p.title,
        image: toAbsUrl(p.src),
      },
    })),
  };

  return [collectionPage, service, itemList];
}

export default async function Page() {
  const data = await getPlantillas();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(data)) }}
      />
      <PlantillasClient data={data} onlyGroup="GI" />
    </>
  );
}
