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

function findRootDownloadedFolder() {
  // gdown crea una carpeta con el nombre real dentro de .tmp_drive
  const entries = fs.readdirSync(TMP).map((n) => path.join(TMP, n));
  const dirs = entries.filter((p) => fs.statSync(p).isDirectory());
  if (!dirs.length) return null;

  // Si hay varias, coge la primera (suele ser la carpeta raíz)
  return dirs[0];
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

  const srcRoot = findRootDownloadedFolder();
  if (!srcRoot)
    throw new Error(
      "No se encontró carpeta descargada en .tmp_drive. Revisa que la carpeta de Drive esté compartida como 'Cualquiera con el enlace' (Lector)."
    );

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
