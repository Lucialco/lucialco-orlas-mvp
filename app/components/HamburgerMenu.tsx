"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Bloquea scroll cuando está abierto
  useEffect(() => {
    if (!mounted) return;
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, mounted]);

  const overlay = (
    <div className={`hm_root ${open ? "isOpen" : ""}`} aria-hidden={!open}>
      <div className="hm_backdrop" onClick={() => setOpen(false)} />

      <aside className="hm_drawer" role="dialog" aria-modal="true" aria-label="Menú">
        <div className="hm_head">
          <div className="hm_title">Menú</div>
          <button type="button" className="hm_close" aria-label="Cerrar" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>

        <nav className="hm_nav">
          <Link href="/plantillas" onClick={() => setOpen(false)} className="hm_item">
            Plantillas <span className="hm_chev">›</span>
          </Link>

          <Link href="/presupuesto" onClick={() => setOpen(false)} className="hm_item">
            Presupuestos <span className="hm_chev">›</span>
          </Link>

          <Link href="/lucia" onClick={() => setOpen(false)} className="hm_item">
            Lucía <span className="hm_chev">›</span>
          </Link>

          <div className="hm_sep" />

          {/* Cambia a tu cuenta real cuando me la pases */}
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noreferrer"
            className="hm_item hm_muted"
            onClick={() => setOpen(false)}
          >
            Instagram <span className="hm_chev">↗</span>
          </a>
        </nav>

        <div className="hm_foot">
          <div className="hm_brand">Lucialco Orlas</div>
        </div>
      </aside>

      <style jsx global>{`
        .hm_root {
          position: fixed;
          inset: 0;
          z-index: 99999;
          pointer-events: none;
        }
        .hm_root.isOpen {
          pointer-events: auto;
        }

        .hm_backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.38);
          backdrop-filter: blur(3px);
          opacity: 0;
          transition: opacity 180ms ease;
        }
        .hm_root.isOpen .hm_backdrop {
          opacity: 1;
        }

        .hm_drawer {
          position: absolute;
          top: 0;
          right: 0;
          height: 100vh;
          width: min(380px, 92vw);
          background: #fff;
          border-left: 1px solid var(--border);
          box-shadow: -18px 0 60px rgba(0, 0, 0, 0.22);
          transform: translateX(100%);
          transition: transform 200ms ease;
          display: flex;
          flex-direction: column;
        }
        .hm_root.isOpen .hm_drawer {
          transform: translateX(0);
        }

        .hm_head {
          padding: 16px 16px 12px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .hm_title {
          font-weight: 900;
          font-size: 16px;
        }
        .hm_close {
          border: 1px solid var(--border);
          background: white;
          border-radius: 12px;
          padding: 8px 10px;
          cursor: pointer;
          font-weight: 900;
          line-height: 1;
        }
        .hm_close:hover {
          background: var(--brand-soft);
          border-color: var(--brand);
        }

        .hm_nav {
          padding: 12px 12px;
          display: grid;
          gap: 6px;
        }

        .hm_item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 12px;
          border-radius: 14px;
          text-decoration: none;
          color: var(--text);
          font-weight: 900;
        }
        .hm_item:hover {
          background: var(--brand-soft);
        }

        .hm_chev {
          color: var(--muted);
          font-weight: 900;
          margin-left: 10px;
        }

        .hm_sep {
          height: 1px;
          background: var(--border);
          margin: 8px 6px;
        }

        .hm_muted {
          color: var(--muted);
          font-weight: 800;
        }

        .hm_foot {
          margin-top: auto;
          padding: 14px 16px;
          border-top: 1px solid var(--border);
        }
        .hm_brand {
          font-size: 12px;
          color: var(--muted);
        }
      `}</style>
    </div>
  );

  return (
    <>
      <button type="button" aria-label="Abrir menú" onClick={() => setOpen(true)} className="hm_btn">
        <span className="hm_burger" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      {mounted && open ? createPortal(overlay, document.body) : null}

      <style jsx global>{`
        .hm_btn {
          border: 1px solid var(--border);
          background: white;
          border-radius: 12px;
          padding: 10px 12px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 44px;
          min-height: 44px;
        }
        .hm_btn:hover {
          background: var(--brand-soft);
          border-color: var(--brand);
        }
        .hm_burger {
          display: inline-grid;
          gap: 4px;
          width: 20px;
        }
        .hm_burger span {
          display: block;
          height: 2px;
          background: var(--text);
          border-radius: 999px;
        }
      `}</style>
    </>
  );
}

