import PlantillasClient from "../plantillas/PlantillasClient";

type Plantilla = { src: string; title: string };
type PlantillasData = Record<string, Plantilla[]>;

export const metadata = {
  title: "Plantillas de Orlas para Primaria y Secundaria | Estilo Actual | Lucialco",
  description:
    "Plantillas de orlas para primaria y secundaria con un diseño moderno y limpio. Revisiones incluidas y entrega lista para imprimir. Solicita presupuesto.",
};

async function getPlantillas(): Promise<PlantillasData> {
  const mod = await import("../../data/plantillas.json");
  return (mod.default ?? mod) as PlantillasData;
}

export default async function Page() {
  const data = await getPlantillas();
  return <PlantillasClient data={data} onlyGroup="PS" />;
}
