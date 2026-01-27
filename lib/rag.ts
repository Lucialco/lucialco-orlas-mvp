import fs from "node:fs";
import path from "node:path";

type Item = {
  id: string;
  url: string;
  text: string;
  embedding: number[];
};

type KB = {
  site: string;
  createdAt: string;
  items: Item[];
};

let cached: KB | null = null;

function safeLoadKB(): KB | null {
  try {
    if (cached) return cached;

    const p = path.join(process.cwd(), "data", "knowledge.json");
    if (!fs.existsSync(p)) {
      console.error("KB missing:", p);
      return null;
    }

    const raw = fs.readFileSync(p, "utf8");
    if (!raw || raw.trim().length < 10) {
      console.error("KB empty or too small");
      return null;
    }

    const parsed = JSON.parse(raw) as KB;
    if (!parsed?.items || !Array.isArray(parsed.items)) {
      console.error("KB invalid shape (missing items[])");
      return null;
    }

    cached = parsed;
    return cached;
  } catch (err) {
    console.error("KB load failed:", err);
    return null; // ✅ NO revienta
  }
}

// De momento: si no hay KB válida -> sin contexto (pero sigue el flujo)
export async function retrieveContext(_query: string, _topK = 6) {
  const kb = safeLoadKB();
  if (!kb) return { context: "", sources: [] as string[] };
  return { context: "", sources: [] as string[] };
}
