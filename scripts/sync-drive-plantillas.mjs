import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "plantillas");
const DATA = path.join(ROOT, "data", "plantillas.json");

const FOLDER_ID = process.env.DRIVE_FOLDER_ID;
if (!FOLDER_ID) throw new Error("Falta DRIVE_FOLDER_ID");

const TMP = path.join(ROOT, ".tmp_drive");
const ZIP = path.join(TMP, "drive.zip");

const CATEGORIES = ["Guarderia", "Infantil", "Primaria", "Secundaria", "Bachillerato"];

function clean(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}
function ensure(p) {
  fs.mkdirSync(p, { recursive: true });
}
function titleFromFile(f) {
  return f.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

async function main() {
  clean(TMP);
  ensure(TMP);

  console.log("⬇️ Descargando ZIP desde Drive…");
  execSync(
    `curl -L "https://drive.google.com/uc?export=download&id=${FOLDER_ID}" -o ${ZIP}`,
    { stdio: "inherit" }
  );

  console.log("📦 Descomprimiendo…");
  execSync(`unzip -o ${ZIP} -d ${TMP}`, { stdio: "inherit" });

  const extracted = fs
    .readdirSync(TMP)
    .find((f) => fs.statSync(path.join(TMP, f)).isDirectory());

  if (!extracted) throw new Error("No se encontró carpeta extraída");

  const SRC = path.join(TMP, extracted);

  clean(OUT);
  ensure(OUT);
  ensure(path.dirname(DATA));

  const result = {};

  for (const cat of CATEGORIES) {
    const srcCat = path.join(SRC, cat);
    const outCat = path.join(OUT, cat);
    ensure(outCat);

    result[cat] = [];

    if (!fs.existsSync(srcCat)) continue;

    for (const file of fs.readdirSync(srcCat)) {
      if (!file.match(/\.(jpe?g)$/i)) continue;

      fs.copyFileSync(path.join(srcCat, file), path.join(outCat, file));

      result[cat].push({
        src: `/plantillas/${cat}/${file}`,
        title: titleFromFile(file),
      });
    }
  }

  fs.writeFileSync(DATA, JSON.stringify(result, null, 2), "utf-8");
  clean(TMP);

  console.log("✅ Sync completado");
}

main();
