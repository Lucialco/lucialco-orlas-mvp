import HomeClient from "./HomeClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orlas escolares personalizadas para colegios | Lucialco",
  description:
    "Diseño de orlas escolares personalizadas para infantil, primaria y secundaria. Proceso fácil para el colegio y entrega lista para imprimir.",

  alternates: {
    canonical: "https://orlas.lucialco.es/",
  },

  openGraph: {
    title: "Orlas escolares personalizadas para colegios | Lucialco",
    description:
      "Diseño de orlas escolares personalizadas para infantil, primaria y secundaria. Proceso fácil para el colegio y entrega lista para imprimir.",
    url: "https://orlas.lucialco.es/",
    siteName: "Lucialco Orlas",
    images: [
      {
        url: "https://orlas.lucialco.es/brand/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Orlas escolares Lucialco",
      },
    ],
    locale: "es_ES",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Orlas escolares personalizadas para colegios | Lucialco",
    description:
      "Diseño de orlas escolares personalizadas para infantil, primaria y secundaria.",
    images: ["https://orlas.lucialco.es/brand/logo.jpg"],
  },
};

export default function Page() {
  return <HomeClient />;
}
