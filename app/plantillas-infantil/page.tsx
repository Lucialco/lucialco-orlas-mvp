import PlantillasClient from "../plantillas/PlantillasClient";

type Plantilla = { src: string; title: string };
type PlantillasData = Record<string, Plantilla[]>;

export const metadata = {
  title: "Plantillas de Orlas Infantiles y Guardería | Diseños Cuidados | Lucialco",
  description:
    "Plantillas de orlas para guardería e infantil, con estilos alegres y delicados. Proceso fácil para el centro y entrega lista para imprimir. Pide presupuesto.",
};

async function getPlantillas(): Promise<PlantillasData> {
  const mod = await import("../../data/plantillas.json");
  return (mod.default ?? mod) as PlantillasData;
}

export default async function Page() {
  const data = await getPlantillas();
  return <PlantillasClient data={data} onlyGroup="GI" />;
}
