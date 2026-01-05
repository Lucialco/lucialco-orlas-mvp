import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Cookie Consent (TermsFeed) */}
        <Script
          src="https://www.termsfeed.com/public/cookie-consent/4.2.0/cookie-consent.js"
          strategy="afterInteractive"
        />
        <Script id="termsfeed-cookieconsent" strategy="afterInteractive">
          {`
            document.addEventListener('DOMContentLoaded', function () {
              cookieconsent.run({
                "notice_banner_type":"headline",
                "consent_type":"express",
                "palette":"light",
                "language":"es",
                "page_load_consent_levels":["strictly-necessary"],
                "notice_banner_reject_button_hide":false,
                "preferences_center_close_button_hide":false,
                "page_refresh_confirmation_buttons":false,
                "website_name":"lucialco.es"
              });
            });
          `}
        </Script>
      </head>

      <body>
        {children}

        {/* Link para abrir el centro de preferencias */}
        <div style={{ padding: 16, textAlign: "center", fontSize: 12 }}>
          <a href="#" id="open_preferences_center" style={{ color: "#111" }}>
            Preferencias de cookies
          </a>
        </div>
      </body>
    </html>
  );
}
