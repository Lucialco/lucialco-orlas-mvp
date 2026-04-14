"use client";

import { useMemo, useState, type FormEvent } from "react";

const WHATSAPP_NUMBER = "34606849914";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
const PRESUPUESTO_URL = "https://orlas.lucialco.es/presupuesto";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  image?: {
    src: string;
    alt: string;
    label: string;
  };
  fallback?: boolean;
};

const suggestedQuestions = [
  "¿Cuánto cuesta una orla?",
  "¿Cuánto tardáis?",
  "¿Para qué cursos hacéis orlas?",
  "¿Cómo funciona el proceso?",
  "¿Qué formato entregáis?",
  "¿Puedo pedir presupuesto?",
];

function normalizeQuestion(question: string) {
  return question
    .toLowerCase()
    .replace(/[¿?¡!.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function buildWhatsAppUrl(question: string) {
  const text = `Hola Lucía, tengo una pregunta sobre las orlas: ${question}`;
  return `${WHATSAPP_LINK}?text=${encodeURIComponent(text)}`;
}

function getBotResponse(question: string): ChatMessage {
  const normalized = normalizeQuestion(question);

  const photoGuideKeywords = [
    "cómo hacer las fotos",
    "como hacer las fotos",
    "guía de fotos",
    "guia de fotos",
    "fotos",
  ];

  if (hasAny(normalized, ["cómo enviar las fotos", "como enviar las fotos", "wetransfer", "mandar las fotos", "enviar las fotos"])) {
    return {
      role: "assistant",
      text:
        "Para enviar las fotos, usa WeTransfer a fotos@lucialco.com. Te explicamos el proceso y te ayudamos a preparar los archivos.",
      image: {
        src: "/wetransfer-guia.png",
        alt: "Guía de envío de fotos por WeTransfer",
        label: "Descargar guía de WeTransfer",
      },
    };
  }

  if (hasAny(normalized, ["cómo hacer las fotos", "como hacer las fotos", "guía de fotos", "guia de fotos"])) {
    return {
      role: "assistant",
      text:
        "Las fotos se hacen en el colegio según nuestra guía. Igual hay ejemplos de encuadre, iluminación y cómo organizar las imágenes para que la orla quede perfecta.",
      image: {
        src: "/como-hacer-fotos.png",
        alt: "Guía sobre cómo hacer las fotos para la orla",
        label: "Descargar guía de fotos",
      },
    };
  }

  if (hasAny(normalized, ["cuánto cuesta", "cuanto cuesta", "precio", "coste", "cuesta una orla"])) {
    return {
      role: "assistant",
      text:
        "Ofrecemos orlas escolares para infantil, primaria y secundaria. En Madrid y Toledo, la modalidad presencial es desde 11.50€/alumno con plantilla o 15€/alumno en exclusiva. Para el resto de España, la modalidad digital es desde 9€/alumno con plantilla o 10.50€/alumno en exclusiva. El transporte es aprox. 15€/pedido. Extras: sobres reforzados con nombre 3€/niño y fotos de recuerdo 4.50€/alumno.",
    };
  }

  if (hasAny(normalized, ["tardáis", "tardais", "tardas", "tardan", "plazo", "cuánto tardáis", "cuanto tardais", "tiempo"])) {
    return {
      role: "assistant",
      text:
        "El plazo depende del volumen y de si el colegio necesita fotos. Lo mejor es contactar para confirmar tiempos concretos y cerrar la fecha de entrega.",
    };
  }

  if (hasAny(normalized, ["para qué cursos", "para que cursos", "cursos", "infantil", "primaria", "secundaria"])) {
    return {
      role: "assistant",
      text:
        "Hacemos orlas escolares para infantil, primaria y secundaria. Si tu centro tiene varias etapas, podemos ajustar el presupuesto y el diseño.",
    };
  }

  if (hasAny(normalized, ["cómo funciona", "como funciona", "proceso", "funciona el proceso"])) {
    return {
      role: "assistant",
      text:
        "El colegio solicita presupuesto en orlas.lucialco.es/presupuesto. Lucialco envía un presupuesto por email válido 15 días. El colegio hace las fotos siguiendo la guía y las envía por WeTransfer a fotos@lucialco.com. Lucialco diseña y entrega la orla digital lista para imprimir.",
    };
  }

  if (hasAny(normalized, ["formato entregáis", "formato", "entregáis", "entregais", "digital lista", "imprimir", "entrega digital"])) {
    return {
      role: "assistant",
      text:
        "Entregamos la orla en formato digital lista para imprimir, preparada para que el colegio o la imprenta pueda usarla con facilidad.",
    };
  }

  if (hasAny(normalized, ["presupuesto", "pedir presupuesto", "puedo pedir presupuesto", "quiero presupuesto", "solicitar presupuesto"])) {
    return {
      role: "assistant",
      text:
        `Sí, puedes pedir presupuesto en ${PRESUPUESTO_URL}. El presupuesto es inmediato en la web y luego Lucialco te enviará la oferta por email con validez 15 días.`,
    };
  }

  if (hasAny(normalized, ["email", "correo", "contacto", "whatsapp", "teléfono", "telefono", "lucía", "lucia"])) {
    return {
      role: "assistant",
      text:
        "Puedes contactar con Lucía en lucia@lucialco.es o por WhatsApp al +34606849914. Si prefieres, abre WhatsApp y envía tu pregunta directamente.",
    };
  }

  return {
    role: "assistant",
    text: "Esta pregunta es mejor que te la responda Lucía directamente.",
    fallback: true,
  };
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hola, soy el chat de Lucialco. Pregúntame sobre orlas escolares, precio, proceso o presupuesto.",
    },
  ]);

  const lastMessage = messages[messages.length - 1];

  const hasFallback = useMemo(() => messages.some((message) => message.fallback), [messages]);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === message.role && last?.text === message.text) {
        return prev;
      }
      return [...prev, message];
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;

    const userMessage: ChatMessage = { role: "user", text: question };
    const answer = getBotResponse(question);

    addMessage(userMessage);
    addMessage(answer);
    setInput("");
    setOpen(true);
  };

  const handleQuickQuestion = (question: string) => {
    const answer = getBotResponse(question);
    addMessage({ role: "user", text: question });
    addMessage(answer);
    setOpen(true);
  };

  return (
    <div className="chatBotRoot" aria-live="polite">
      {open && (
        <div className="chatPanel" role="dialog" aria-label="Chat de ayuda de Lucialco">
          <div className="chatHeader">
            <div>
              <div className="chatTitle">¿Tienes dudas?</div>
              <div className="chatSubtitle">Respuestas rápidas sobre orlas escolares</div>
            </div>
            <button type="button" className="chatClose" onClick={() => setOpen(false)} aria-label="Cerrar chat">
              ×
            </button>
          </div>

          <div className="chatContent">
            <div className="chatMessages">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`chatMessage ${message.role}`}>
                  <div className="chatBubble">
                    <span>{message.text}</span>
                    {message.image && (
                      <div className="chatImageCard">
                        <img src={message.image.src} alt={message.image.alt} />
                        <a href={message.image.src} download className="chatImageLink">
                          {message.image.label}
                        </a>
                      </div>
                    )}
                    {message.fallback && (
                      <a href={buildWhatsAppUrl(message.text)} target="_blank" rel="noreferrer" className="chatActionButton">
                        Contactar por WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="chatSuggest">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  className="suggestButton"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          <form className="chatForm" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Escribe tu pregunta..."
              aria-label="Escribe tu pregunta"
            />
            <button type="submit">Enviar</button>
          </form>
        </div>
      )}

      <button type="button" className="chatFab" onClick={() => setOpen((current) => !current)} aria-label="Abrir chat de Lucialco">
        <span className="faIcon">💬</span>
        <span className="fabText">¿Tienes dudas?</span>
      </button>

      <style jsx>{`
        .chatBotRoot {
          position: fixed;
          bottom: 16px;
          right: 16px;
          z-index: 9999;
          font-family: Inter, system-ui, sans-serif;
          color: #0f172a;
        }

        .chatFab {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border: none;
          border-radius: 999px;
          background: linear-gradient(135deg, #0f766e, #14b8a6);
          color: white;
          font-weight: 700;
          box-shadow: 0 18px 40px rgba(15, 118, 110, 0.24);
          cursor: pointer;
          min-width: 220px;
          max-width: 100%;
        }

        .faIcon {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.16);
          font-size: 18px;
          box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.35);
        }

        .fabText {
          white-space: nowrap;
        }

        .chatPanel {
          width: min(360px, 96vw);
          max-height: min(88vh, 680px);
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 0;
          background: white;
          border-radius: 24px;
          box-shadow: 0 35px 80px rgba(15, 118, 110, 0.16);
          overflow: hidden;
          margin-bottom: 12px;
        }

        .chatHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px;
          background: #0f766e;
          color: white;
        }

        .chatTitle {
          font-size: 16px;
          font-weight: 800;
        }

        .chatSubtitle {
          font-size: 13px;
          opacity: 0.86;
        }

        .chatClose {
          border: none;
          background: transparent;
          color: white;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
        }

        .chatContent {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 0 16px 8px;
        }

        .chatMessages {
          display: grid;
          gap: 10px;
          overflow-y: auto;
          max-height: 320px;
          padding-right: 4px;
        }

        .chatMessage {
          display: flex;
          width: 100%;
        }

        .chatMessage.user {
          justify-content: flex-end;
        }

        .chatBubble {
          max-width: 100%;
          padding: 12px 14px;
          border-radius: 18px;
          white-space: pre-line;
          line-height: 1.5;
        }

        .chatMessage.user .chatBubble {
          background: #ecfdf5;
          color: #0f766e;
          border-bottom-right-radius: 6px;
        }

        .chatMessage.assistant .chatBubble {
          background: #f8fafc;
          color: #0f172a;
          border-bottom-left-radius: 6px;
        }

        .chatImageCard {
          margin-top: 10px;
          border: 1px solid #d1fae5;
          border-radius: 16px;
          overflow: hidden;
        }

        .chatImageCard img {
          width: 100%;
          display: block;
          aspect-ratio: 16 / 9;
          object-fit: cover;
        }

        .chatImageLink {
          display: block;
          width: 100%;
          padding: 10px 12px;
          background: #0f766e;
          color: white;
          text-align: center;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
        }

        .chatActionButton {
          display: inline-flex;
          margin-top: 10px;
          padding: 10px 14px;
          border-radius: 999px;
          border: none;
          background: #14b8a6;
          color: white;
          text-decoration: none;
          font-weight: 700;
        }

        .chatSuggest {
          display: grid;
          gap: 8px;
          padding-bottom: 4px;
        }

        .suggestButton {
          border: 1px solid #d1fae5;
          background: #ecfdf5;
          color: #0f766e;
          border-radius: 999px;
          padding: 10px 14px;
          text-align: left;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
        }

        .chatForm {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
          padding: 0 16px 16px;
        }

        .chatForm input {
          width: 100%;
          min-height: 44px;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid #cbd5e1;
          font-size: 14px;
        }

        .chatForm button {
          border: none;
          border-radius: 14px;
          padding: 12px 16px;
          background: #0f766e;
          color: white;
          font-weight: 700;
          cursor: pointer;
          min-width: 90px;
        }

        @media (max-width: 520px) {
          .chatBotRoot {
            right: 8px;
            bottom: 8px;
          }

          .chatPanel {
            width: min(100vw, 100%);
            border-radius: 20px;
          }

          .chatForm {
            grid-template-columns: 1fr;
          }

          .chatForm button {
            width: 100%;
          }

          .chatFab {
            min-width: 180px;
            padding: 12px 14px;
          }
        }
      `}</style>
    </div>
  );
}
