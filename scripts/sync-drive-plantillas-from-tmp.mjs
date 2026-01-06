import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const TMP = path.join(ROOT, ".tmp_drive");
const OUT = path.join(ROOT, "public", "plantillas");
const DATA = path.join(ROOT, "data", "plantillas.json");

const CATEGORIES = ["Guarderia", "Infantil", "Primaria", "Secundaria", "Bachillerato"];

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
  const entries = fs.readdirSync(TMP).map((n) => path.join(TMP, n)).filter(isDir);

  // Busca la primera subcarpeta que contenga categorías
  for (const d of entries) {
    if (hasCategoryFolders(d)) return d;
  }

  // Si no encuentra, devuelve null
  return null;
}

function listJpgFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.match(/\.(jpe?g)$/i))
    .sort((a, b) => a.localeCompare(b, "es"));
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

    const files = listJpgFiles(srcCat);

    result[cat] = files.map((file) => {
      fs.copyFileSync(path.join(srcCat, file), path.join(outCat, file));
      return { src: `/plantillas/${cat}/${file}`, title: titleFromFile(file) };
    });
  }

  fs.writeFileSync(DATA, JSON.stringify(result, null, 2), "utf-8");
  console.log("✅ OK: plantillas.json generado y archivos copiados a public/plantillas");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

