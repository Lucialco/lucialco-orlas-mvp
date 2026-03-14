import Link from "next/link";

export const metadata = {
  title: "Orlas escolares personalizadas para colegios | Lucialco",
  description:
    "Diseño de orlas escolares personalizadas para infantil, primaria y secundaria. Proceso fácil para el colegio y entrega lista para imprimir.",
};

export default function Home() {
  return (
    <main style={{ maxWidth: "900px", margin: "auto", padding: "40px" }}>
      <h1>Orlas escolares sin complicaciones. Nos encargamos de todo.</h1>

      <p>
        Diseñamos orlas escolares personalizadas para colegios de infantil,
        primaria y secundaria. Nuestro objetivo es que cada promoción tenga un
        recuerdo cuidado y fácil de organizar para el centro educativo.
      </p>

      <h2>Cómo funciona</h2>

      <p>
        El colegio recopila las fotografías de alumnos y profesores y nosotros
        nos encargamos del diseño completo de la orla. Adaptamos el estilo al
        centro y entregamos el archivo final listo para imprimir.
      </p>

      <h2>Orlas escolares personalizadas</h2>

      <p>
        Cada orla se diseña pensando en el estilo del colegio. Podemos trabajar
        con plantillas o con diseños completamente a medida para crear un
        recuerdo especial para cada promoción.
      </p>

      <p>
        <Link href="/orlas-escolares">Ver información sobre orlas escolares</Link>
      </p>
    </main>
  );
}
