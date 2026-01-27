"use client";

import { useState } from "react";

type Msg = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hola 👋 Soy el asistente de Lucialco Orlas. ¿Quieres info o presupuesto?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim() || loading) return;

    const next = [...msgs, { role: "user", content: input }];
    setMsgs(next);
    setInput("");
    setLoading(true);

    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: next }),
    });

    const data = await r.json();

    setMsgs([
      ...next,
      {
        role: "assistant",
        content: data.text || "No he podido responder.",
      },
    ]);

    setLoading(false);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="w-[340px] h-[440px] bg-white rounded-2xl shadow-xl border flex flex-col overflow-hidden">
          <div className="p-3 border-b flex justify-between items-center">
            <strong>Lucialco Orlas</strong>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="flex-1 p-3 overflow-auto space-y-2">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "text-right" : "text-left"}
              >
                <div
                  className={`inline-block px-3 py-2 rounded-2xl text-sm max-w-[85%] ${
                    m.role === "user"
                      ? "bg-black text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-sm text-gray-500">Escribiendo…</div>
            )}
          </div>

          <div className="p-3 border-t flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              className="flex-1 border rounded-xl px-3 py-2 text-sm"
              placeholder="Ej: presupuesto para 45 alumnos exclusiva con becas"
            />
            <button
              onClick={send}
              className="px-4 py-2 bg-black text-white rounded-xl text-sm"
            >
              Enviar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="h-12 w-12 rounded-full bg-black text-white shadow-lg"
        >
          💬
        </button>
      )}
    </div>
  );
}
