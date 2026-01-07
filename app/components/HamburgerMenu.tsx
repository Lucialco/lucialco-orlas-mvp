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

      {open && (
        <div className="hm_overlay" role="dialog" aria-modal="true">
          <div className="hm_backdrop" onClick={() => setOpen(false)} />

          <aside className="hm_panel">
            <div className="hm_top">
              <div className="hm_title">Menú</div>
              <button
                type="button"
                className="hm_close"
                aria-label="Cerrar"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <nav className="hm_nav" aria-label="Menú">
              <Link href="/plantillas" onClick={() => setOpen(false)} className="hm_link">
                Plantillas
              </Link>
              <Link href="/presupuesto" onClick={() => setOpen(false)} className="hm_link">
                Presupuestos
              </Link>
              <Link href="/lucia" onClick={() => setOpen(false)} className="hm_link">
                Lucía
              </Link>

              <div className="hm_divider" />

              {/* Cambia el link cuando me des tu @ */}
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                className="hm_link hm_linkMuted"
                onClick={() => setOpen(false)}
              >
                Instagram
              </a>
            </nav>

            <div className="hm_footer">
              <div className="hm_note">Lucialco Orlas</div>
            </div>
          </aside>
        </div>
      )}

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

        .hm_overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
        }

        .hm_backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(2px);
        }

        .hm_panel {
          position: absolute;
          right: 14px;
          top: 14px;
          height: calc(100% - 28px);
          width: 320px;
          max-width: calc(100% - 28px);
          background: white;
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 18px 60px rgba(0, 0, 0, 0.18);
          animation: hm_in 160ms ease-out;
          display: flex;
          flex-direction: column;
        }

        @keyframes hm_in {
          from {
            transform: translateX(10px);
            opacity: 0.6;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .hm_top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border);
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
          margin-top: 12px;
          display: grid;
          gap: 10px;
        }

        .hm_link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 12px;
          border-radius: 14px;
          border: 1px solid var(--border);
          text-decoration: none;
          color: var(--text);
          font-weight: 900;
          background: white;
        }

        .hm_link:hover {
          background: var(--brand-soft);
          border-color: var(--brand);
        }

        .hm_linkMuted {
          color: var(--muted);
          font-weight: 800;
        }

        .hm_divider {
          height: 1px;
          background: var(--border);
          margin: 6px 0;
        }

        .hm_footer {
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid var(--border);
        }

        .hm_note {
          font-size: 12px;
          color: var(--muted);
        }
      `}</style>
    </>
  );
}


