import PlantillasClient from "./PlantillasClient";

type Plantilla = { src: string; title: string };
type PlantillasData = Record<string, Plantilla[]>;

async function getPlantillas(): Promise<PlantillasData> {
  const mod = await import("../../data/plantillas.json");
  return (mod.default ?? mod) as PlantillasData;
}

export default async function PlantillasPage() {
  const data = await getPlantillas();
  return <PlantillasClient data={data} />;
}
