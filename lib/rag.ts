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
    cached = JSON.parse(raw);
    return cached!;
  } catch (err) {
    console.error("KB load failed:", err);
    return null;
  }
}

export async function retrieveContext(query: string, topK = 6) {
  const kb = safeLoadKB();

  if (!kb || !kb.items?.length) {
    return { context: "", sources: [] as string[] };
  }

  // ⚠️ Sin embeddings → no RAG
  return { context: "", sources: [] as string[] };
}
