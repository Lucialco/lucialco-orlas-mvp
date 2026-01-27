"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "¡Hola! Soy el asistente de Lucialco Orlas 😊\n¿Quieres un presupuesto o tienes una duda?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    // auto-scroll al final
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [open, msgs, loading]);

  const styles = useMemo(() => {
    return {
      wrapper: {
        position: "fixed" as const,
        right: 18,
        bottom: 18,
        zIndex: 99999,
        fontFamily:
          'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
      },
      launcher: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        borderRadius: 999,
        border: "1px solid rgba(0,0,0,0.12)",
        background: "#ffffff",
        padding: "10px 12px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
        cursor: "pointer",
      },
      launcherText: {
        fontSize: 13,
        lineHeight: "16px",
        color: "#111",
        maxWidth: 180,
      },
      badge: {
        display: "inline-block",
        fontSize: 12,
        background: "#0f172a",
        color: "white",
        padding: "3px 8px",
        borderRadius: 999,
        marginTop: 2,
      },
      panel: {
        width: 360,
        height: 520,
        borderRadius: 16,
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.12)",
        boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
        overflow: "hidden",
      },
      header: {
        padding: "12px 12px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background:
          "linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(30,41,59,1) 100%)",
        color: "white",
      },
      headerLeft: { display: "flex", alignItems: "center", gap: 10 },
      title: { fontWeight: 700, fontSize: 14, margin: 0 },
      subtitle: { fontSize: 12, opacity: 0.9, margin: 0 },
      closeBtn: {
        border: "none",
        background: "rgba(255,255,255,0.15)",
        color: "white",
        width: 34,
        height: 34,
        borderRadius: 10,
        cursor: "pointer",
        fontSize: 18,
        lineHeight: "34px",
      },
      list: {
        padding: 12,
        height: 520 - 58 - 70,
        overflowY: "auto" as const,
        background: "#f7f7fb",
      },
      bubbleRow: (role: Msg["role"]) => ({
        display: "flex",
        justifyContent: role === "user" ? "flex-end" : "flex-start",
        marginBottom: 10,
      }),
      bubble: (role: Msg["role"]) => ({
        maxWidth: "82%",
        whiteSpace: "pre-wrap" as const,
        padding: "10px 12px",
        borderRadius: 16,
        fontSize: 13,
        lineHeight: "18px",
        background: role === "user" ? "#0f172a" : "#ffffff",
        color: role === "user" ? "#ffffff" : "#111111",
        border:
          role === "user"
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.08)",
        boxShadow:
          role === "user"
            ? "0 6px 18px rgba(15,23,42,0.25)"
            : "0 6px 18px rgba(0,0,0,0.08)",
      }),
      composer: {
        padding: 12,
        borderTop: "1px solid rgba(0,0,0,0.08)",
        background: "#ffffff",
        display: "flex",
        gap: 8,
        alignItems: "center",
      },
      input: {
        flex: 1,
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.18)",
        outline: "none",
        fontSize: 13,
      },
      sendBtn: {
        padding: "10px 12px",
        borderRadius: 12,
        border: "none",
        background: "#0f172a",
        color: "white",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 13,
      },
      hint: {
        fontSize: 11,
        color: "rgba(0,0,0,0.55)",
        marginTop: 8,
      },
      typing: {
        fontSize: 12,
        color: "rgba(0,0,0,0.55)",
        margin: "6px 0 0 0",
      },
      avatarWrap: {
        width: 38,
        height: 38,
        borderRadius: 999,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.12)",
        background: "#fff",
        flex: "0 0 auto",
      },
    };
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...msgs, { role: "user" as const, content: text }];
    setMsgs(next);
    setInput("");
    setLoading(true);

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      const data = await r.json();
      const reply =
        data?.text ||
        "Se me ha ido la pinza. ¿Lo vemos por WhatsApp? https://wa.me/34606849914";

      setMsgs([...next, { role: "assistant", content: reply }]);
    } catch {
      setMsgs([
        ...next,
        {
          role: "assistant",
          content:
            "Ahora mismo no puedo conectar. Prueba de nuevo o escríbenos por WhatsApp: https://wa.me/34606849914",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      {!open ? (
        <div style={styles.launcher} onClick={() => setOpen(true)}>
          {/* Avatar (si no tienes imagen, deja el bloque y pon un emoji) */}
          <div style={styles.avatarWrap}>
            <Image
              src="/brand/logo.jpg"
              alt="Lucialco"
              width={60}
              height={60}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div>
            <div style={styles.launcherText}>
              ¿Dudas o presupuesto? Te lo calculo aquí.
            </div>
            <div style={styles.badge}>Asistente</div>
          </div>
        </div>
      ) : (
        <div style={styles.panel}>
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.avatarWrap}>
                <Image
                  src="/brand/logo.jpg"
                  alt="Lucialco"
                  width={60}
                  height={60}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div>
                <p style={styles.title as any}>Lucialco Orlas</p>
                <p style={styles.subtitle as any}>Asistente de dudas y presupuestos</p>
              </div>
            </div>
            <button style={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Cerrar">
              ×
            </button>
          </div>

          <div ref={listRef} style={styles.list}>
            {msgs.map((m, i) => (
              <div key={i} style={styles.bubbleRow(m.role)}>
                <div style={styles.bubble(m.role)}>{m.content}</div>
              </div>
            ))}
            {loading && <div style={styles.typing}>Escribiendo…</div>}
            <div style={styles.hint}>
              Tip: “presupuesto 30 alumnos” o “¿qué fotos valen?”
            </div>
          </div>

          <div style={styles.composer}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Escribe aquí…"
              style={styles.input}
            />
            <button style={styles.sendBtn} onClick={send}>
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
