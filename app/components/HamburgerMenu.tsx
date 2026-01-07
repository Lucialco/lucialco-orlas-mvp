"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menú"
        onClick={() => setOpen(true)}
        className="hm_btn"
      >
        <span className="hm_burger" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      {/* Drawer */}
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
              Plantillas
              <span className="hm_chev">›</span>
            </Link>

            <Link href="/presupuesto" onClick={() => setOpen(false)} className="hm_item">
              Presupuestos
              <span className="hm_chev">›</span>
            </Link>

            <Link href="/lucia" onClick={() => setOpen(false)} className="hm_item">
              Lucía
              <span className="hm_chev">›</span>
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
              Instagram
              <span className="hm_chev">↗</span>
            </a>
          </nav>

          <div className="hm_foot">
            <div className="hm_brand">Lucialco Orlas</div>
          </div>
        </aside>
      </div>

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

        /* Root overlay (hidden when closed) */
        .hm_root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          pointer-events: none;
        }
        .hm_root.isOpen {
          pointer-events: auto;
        }

        .hm_backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(2px);
          opacity: 0;
          transition: opacity 160ms ease;
        }
        .hm_root.isOpen .hm_backdrop {
          opacity: 1;
        }

        /* Drawer */
        .hm_drawer {
          position: absolute;
          top: 0;
          right: 0;
          height: 100%;
          width: 360px;
          max-width: 92vw;
          background: white;
          border-left: 1px solid var(--border);
          box-shadow: -18px 0 60px rgba(0, 0, 0, 0.2);
          transform: translateX(100%);
          transition: transform 180ms ease;
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
          padding: 12px 10px;
          display: grid;
          gap: 8px;
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
          background: transparent;
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
          margin: 6px 6px;
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
    </>
  );
}
