import Script from "next/script";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import HamburgerMenu from "./components/HamburgerMenu";
// import ChatWidget from "./components/ChatWidget"; // ✅ Quitamos el bot

const GTM_ID = "GTM-T9LNC454";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm-head"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />
        {/* End Google Tag Manager */}
      </head>

      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {/* Cookie Consent (TermsFeed) */}
        <Script
          id="termsfeed-cookieconsent-lib"
          src="https://www.termsfeed.com/public/cookie-consent/4.2.0/cookie-consent.js"
          strategy="afterInteractive"
        />

        <Script id="termsfeed-cookieconsent-init" strategy="afterInteractive">
          {`
            (function () {
              function runConsent() {
                if (!window.cookieconsent) return;

                window.cookieconsent.run({
                  notice_banner_type: "headline",
                  consent_type: "express",
                  palette: "light",
                  language: "es",
                  page_load_consent_levels: [],
                  notice_banner_reject_button_hide: false,
                  preferences_center_close_button_hide: false,
                  page_refresh_confirmation_buttons: false,
                  website_name: "lucialco.es"
                });
              }

              var tries = 0;
              var t = setInterval(function () {
                tries++;
                if (window.cookieconsent) {
                  clearInterval(t);
                  runConsent();
                }
                if (tries > 60) clearInterval(t);
              }, 100);

              document.addEventListener("click", function (e) {
                var target = e.target;
                if (!target || !target.closest) return;

                var link = target.closest("#open_preferences_center");
                if (!link) return;

                e.preventDefault();

                try {
                  if (window.cookieconsent && window.cookieconsent.openPreferencesCenter) {
                    window.cookieconsent.openPreferencesCenter();
                    return;
                  }
                } catch (err) {}
              });
            })();
          `}
        </Script>

        {/* ===== HEADER DE MARCA ===== */}
        <header className="siteHeader siteHeader--pro">
          <div
            className="siteHeaderInner"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Link href="/" className="brand" aria-label="Lucialco Orlas">
              <Image
                src="/brand/logo.jpg"
                alt="Lucialco Orlas"
                width={520}
                height={160}
                priority
                sizes="(max-width: 640px) 200px, 320px"
                className="brandLogo"
              />
            </Link>

            {/* ✅ Solo hamburguesa (FAQ va dentro del menú) */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <HamburgerMenu />
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="page">{children}</main>

        {/* ✅ Quitamos el bot */}
        {/* <ChatWidget /> */}

        {/* Footer */}
        <footer className="footer">
          <div className="footerInner">
            <div>© {new Date().getFullYear()} Lucialco Orlas</div>

            <div className="footerLinks">
              <Link href="/faq">FAQ</Link>
              <span>·</span>
              <Link href="/aviso-legal">Aviso legal</Link>
              <span>·</span>
              <Link href="/politica-privacidad">Política de privacidad</Link>
              <span>·</span>
              <Link href="/politica-cookies">Política de cookies</Link>
              <span>·</span>
              <a href="#" id="open_preferences_center">
                Preferencias de cookies
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
