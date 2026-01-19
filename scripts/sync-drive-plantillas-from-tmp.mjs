import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const TMP = path.join(ROOT, ".tmp_drive");
const OUT = path.join(ROOT, "public", "plantillas");
const DATA = path.join(ROOT, "data", "plantillas.json");

const CATEGORIES = ["Guarderia", "Infantil", "Primaria", "Secundaria", "Bachillerato"];

// Orden de preferencia de formatos (por si conviven)
const EXT_PRIORITY = [".webp", ".jpg", ".jpeg", ".png"];

function clean(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}
function ensure(p) {
  fs.mkdirSync(p, { recursive: true });
}
function titleFromFile(f) {
  return f
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isDir(p) {
  return fs.existsSync(p) && fs.statSync(p).isDirectory();
}

function hasCategoryFolders(rootDir) {
  return CATEGORIES.some((c) => isDir(path.join(rootDir, c)));
}

function findBestRoot() {
  // Caso 1: gdown descarga las carpetas de categoría directamente en .tmp_drive
  if (hasCategoryFolders(TMP)) return TMP;

  // Caso 2: gdown crea una carpeta raíz dentro de .tmp_drive (p.ej. "Lucialco_Orlas")
  const entries = fs
    .readdirSync(TMP)
    .map((n) => path.join(TMP, n))
    .filter(isDir);

  // Busca la primera subcarpeta que contenga categorías
  for (const d of entries) {
    if (hasCategoryFolders(d)) return d;
  }

  return null;
}

function fileExtLower_(f) {
  return path.extname(f || "").toLowerCase();
}

function isImageAllowed_(f) {
  const ext = fileExtLower_(f);
  return EXT_PRIORITY.includes(ext);
}

/**
 * Orden “humano”:
 * - Si el nombre empieza por número, ordena por ese número
 * - Si no, orden alfabético ES
 */
function smartSort_(a, b) {
  const an = (a.match(/^(\d+)/) || [])[1];
  const bn = (b.match(/^(\d+)/) || [])[1];

  if (an && bn) {
    const ai = Number(an);
    const bi = Number(bn);
    if (ai !== bi) return ai - bi;
  } else if (an && !bn) {
    return -1;
  } else if (!an && bn) {
    return 1;
  }

  return a.localeCompare(b, "es", { sensitivity: "base" });
}

/**
 * Lista archivos de imágenes de una carpeta.
 * - Preferencia: webp > jpg/jpeg > png
 * - Si conviven varios formatos del mismo "base name", escoge el mejor por prioridad.
 */
function listBestImageFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  const all = fs.readdirSync(dir).filter((f) => isImageAllowed_(f));

  // Agrupa por nombre base (sin extensión)
  const byBase = new Map(); // base -> { file, extIndex }
  for (const f of all) {
    const ext = fileExtLower_(f);
    const base = f.slice(0, -ext.length);

    const extIndex = EXT_PRIORITY.indexOf(ext);
    if (extIndex === -1) continue;

    const prev = byBase.get(base);
    // nos quedamos con el de mayor prioridad (menor index)
    if (!prev || extIndex < prev.extIndex) {
      byBase.set(base, { file: f, extIndex });
    }
  }

  const chosen = Array.from(byBase.values()).map((x) => x.file);
  chosen.sort(smartSort_);
  return chosen;
}

async function main() {
  if (!fs.existsSync(TMP)) throw new Error("No existe .tmp_drive (falló la descarga de Drive).");

  const srcRoot = findBestRoot();
  if (!srcRoot) {
    throw new Error(
      "No se encontraron carpetas de categorías en lo descargado. Revisa: (1) nombres exactos de carpetas en Drive (Guarderia/Infantil/Primaria/Secundaria/Bachillerato), (2) que la carpeta Drive esté compartida como 'Cualquiera con el enlace' (Lector)."
    );
  }

  clean(OUT);
  ensure(OUT);
  ensure(path.dirname(DATA));

  const result = {};

  for (const cat of CATEGORIES) {
    const srcCat = path.join(srcRoot, cat);
    const outCat = path.join(OUT, cat);
    ensure(outCat);

    const files = listBestImageFiles(srcCat);

    result[cat] = files.map((file) => {
      // Copia exactamente el archivo que exista (.webp preferente)
      fs.copyFileSync(path.join(srcCat, file), path.join(outCat, file));
      return { src: `/plantillas/${cat}/${file}`, title: titleFromFile(file) };
    });
  }

  fs.writeFileSync(DATA, JSON.stringify(result, null, 2), "utf-8");
  console.log("✅ OK: plantillas.json generado y archivos copiados a public/plantillas (webp-first)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


