import Link from "next/link";

export default function Page() {
  return (
    <main style={{ maxWidth: "900px", margin: "auto", padding: "40px" }}>
      <h1>Orlas escolares personalizadas</h1>

      <p>
        Diseñamos orlas escolares personalizadas para colegios de infantil,
        primaria y secundaria. Creamos diseños cuidados que se adaptan al
        estilo de cada centro educativo.
      </p>

      <h2>Cómo crear una orla escolar</h2>

      <p>
        El colegio recopila las fotografías de alumnos y profesores. A partir
        de ahí diseñamos la orla completa y preparamos el archivo final listo
        para imprimir.
      </p>

      <h2>Diseños de orlas para colegios</h2>

      <p>
        Podemos trabajar con plantillas o crear un diseño completamente
        personalizado adaptado a los colores y estilo del centro.
      </p>

      <p>
        <Link href="/">Volver a la página principal</Link>
      </p>
    </main>
  );
}
