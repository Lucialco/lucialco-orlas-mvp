import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
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

                  // 👇 CLAVE: así SÍ salta el banner
                  page_load_consent_levels: [],

                  notice_banner_reject_button_hide: false,
                  preferences_center_close_button_hide: false,
                  page_refresh_confirmation_buttons: false,

                  website_name: "lucialco.es"
                });
              }

              // Espera a que cargue la librería
              var tries = 0;
              var t = setInterval(function () {
                tries++;
                if (window.cookieconsent) {
                  clearInterval(t);
                  runConsent();
                }
                if (tries > 60) clearInterval(t);
              }, 100);

              // Link del footer: abre el centro de preferencias
              document.addEventListener("click", function (e) {
                var el = e.target;
                if (!el) return;

                // Si clickas en el link o en un hijo del link
                var link = el.closest && el.closest("#open_preferences_center");
                if (!link) return;

                e.preventDefault();

                // 1) Si TermsFeed expone un método para abrir preferencias, úsalo
                try {
                  if (window.cookieconsent && window.cookieconsent.openPreferencesCenter) {
                    window.cookieconsent.openPreferencesCenter();
                    return;
                  }
                } catch (err) {}
