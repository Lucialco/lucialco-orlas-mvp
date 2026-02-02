export const metadata = {
  title: "Preguntas frecuentes | Lucialco Orlas",
  description:
    "Resolvemos las dudas más habituales sobre orlas escolares, fotos, envío, diseño, plazos y extras.",
};

const FAQ = [
  {
    q: "¿Cómo se hacen las fotos?",
    a: "Depende de la provincia. En Madrid y Toledo hacemos sesión presencial en el centro. En el resto de España, el colegio hace las fotos siguiendo nuestra guía y nos las envía para el retoque y diseño.",
  },
  {
    q: "¿Qué necesitamos para que las fotos queden bien?",
    a: "Misma prenda arriba para todos, fondo liso, buena luz natural y la cámara siempre a la misma altura. Te enviamos una guía paso a paso.",
  },
  {
    q: "¿Cuánto tardáis en entregar la orla?",
    a: "Depende del número de alumnos y del tipo de orla, pero normalmente entre 2 y 4 semanas desde que recibimos todas las fotos y la información.",
  },
  {
    q: "¿Se pueden incluir profesores?",
    a: "Sí. Se colocan normalmente en la parte superior de la composición.",
  },
  {
    q: "¿Podemos revisar la orla antes de imprimir?",
    a: "Sí. Siempre enviamos una previsualización digital para validar nombres, posiciones y diseño.",
  },
  {
    q: "¿Qué formato tiene la orla?",
    a: "Se entrega en tamaño A3, impresa en papel de alta calidad y buen gramaje.",
  },
  {
    q: "¿Hacéis envíos a toda España?",
    a: "Sí. En modalidad digital trabajamos con colegios de cualquier provincia y enviamos el pedido completo por mensajería.",
  },
  {
    q: "¿Qué extras se pueden añadir?",
    a: "Becas de graduación personalizadas, tazas con foto, sobres reforzados y packs de fotos de recuerdo.",
  },
  {
    q: "¿El precio de los extras es definitivo?",
    a: "El precio es orientativo hasta confirmar acabados finales como impresión o tipos de color.",
  },
  {
    q: "¿Cómo os enviamos las fotos?",
    a: "Por WeTransfer. Te damos una guía con la dirección exacta y cómo subirlas correctamente.",
  },
  {
    q: "¿Cuánto tiempo es válido el presupuesto?",
    a: "Todos los presupuestos tienen una validez de 15 días.",
  },
  {
    q: "¿Cómo puedo contactar con vosotros?",
    a: "Puedes escribirnos por WhatsApp o responder al email del presupuesto. Siempre habla con personas reales.",
  },
];

export default function FAQPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <div className="badge">Ayuda · Preguntas frecuentes</div>

      <h1 className="mt-4 text-4xl font-extrabold tracking-tight">
        Preguntas frecuentes
      </h1>

      <p className="mt-4 text-lg text-neutral-600">
        Resolvemos las dudas más habituales antes de hacer tu orla escolar.
      </p>

      <div className="mt-10 space-y-4">
        {FAQ.map((item, i) => (
          <details
            key={i}
            className="group rounded-2xl border border-neutral-200 bg-white p-4"
          >
            <summary className="cursor-pointer font-bold text-neutral-900">
              {item.q}
            </summary>

            <p className="mt-3 text-neutral-700 leading-relaxed">
              {item.a}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-14 rounded-2xl border border-neutral-200 bg-[var(--brand-soft)] p-6">
        <h2 className="text-xl font-bold">
          ¿Sigues teniendo dudas?
        </h2>
        <p className="mt-2 text-neutral-700">
          Escríbenos directamente y te ayudamos encantadas.
        </p>

        <a
          href="https://wa.me/34606849914"
          target="_blank"
          rel="noreferrer"
          className="btnPrimary mt-4 inline-block"
        >
          Hablar por WhatsApp
        </a>
      </div>
    </main>
  );
}
