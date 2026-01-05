import Script from "next/script";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
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
      </head>

      <body>
        {children}

        {/* Footer legal */}
        <div style={{ padding: 16, textAlign: "center", fontSize: 12 }}>
          <a href="/aviso-legal">Aviso legal</a> |{" "}
          <a href="/politica-privacidad">Política de privacidad</a> |{" "}
          <a href="/politica-cookies">Política de cookies</a> |{" "}
          <a href="#" id="open_preferences_center">
            Preferencias de cookies
          </a>
        </div>
      </body>
    </html>
  );
}
