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
        className="menuBtn"
      >
        <span className="burger" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {open && (
        <div className="menuOverlay" role="dialog" aria-modal="true">
          <div className="menuBackdrop" onClick={() => setOpen(false)}></div>

          <div className="menuPanel">
            <div className="menuTop">
              <div style={{ fontWeight: 900 }}>Menú</div>

              <button
                type="button"
                className="menuClose"
                aria-label="Cerrar"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <nav className="menuNav" aria-label="Menú">
              <Link href="/plantillas" onClick={() => setOpen(false)} className="menuLink">
                Plantillas
              </Link>

              <Link href="/presupuesto" onClick={() => setOpen(false)} className="menuLink">
                Presupuestos
              </Link>

              <Link href="/lucia" onClick={() => setOpen(false)} className="menuLink">
                Lucía
              </Link>

              <div className="menuDivider"></div>

              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                className="menuLink"
                onClick={() => setOpen(false)}
              >
                Instagram
              </a>
            </nav>
          </div>
        </div>
      )}

      <style jsx global>{`
        .menuBtn {
          border: 1px solid var(--border);
          background: white;
          border-radius: 12px;
          padding: 10px 12px;
          cursor: pointer;
        }

        .burger {
          display: inline-grid;
          gap: 4px;
          width: 20px;
        }

        .burger span {
          display: block;
          height: 2px;
          background: var(--text);
          border-radius: 999px;
        }

        .menuOverlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
        }

        .menuBackdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
        }

        .menuPanel {
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          width: 320px;
          background: white;
          border-left: 1px solid var(--border);
          padding: 16px;
          box-shadow: -12px 0 30px rgba(0, 0, 0, 0.12);
        }

        .menuTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .menuClose {
          border: 1px solid var(--border);
          background: white;
          border-radius: 12px;
          padding: 6px 10px;
          cursor: pointer;
          font-weight: 900;
        }

        .menuNav {
          margin-top: 14px;
          display: grid;
          gap: 10px;
        }

        .menuDivider {
          height: 1px;
          background: var(--border);
          margin: 6px 0;
        }

        .menuLink {
          display: block;
          padding: 12px 12px;
          border-radius: 12px;
          border: 1px solid var(--border);
          text-decoration: none;
          color: var(--text);
          font-weight: 900;
        }

        .menuLink:hover {
          background: var(--brand-soft);
          border-color: var(--brand);
        }
      `}</style>
    </>
  );
}

