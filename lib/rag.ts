// lib/rag.ts
import kb from "../data/knowledge.json";

type Item = {
  id?: string;
  url?: string;
  text?: string;
};

type KB = {
  site?: string;
  createdAt?: string;
  items?: Item[];
};

// Búsqueda simple por texto (sin embeddings) para que no rompa producción.
export async function retrieveContext(query: string, topK = 6) {
  const data = (kb as unknown as KB) || {};
  const items = Array.isArray(data.items) ? data.items : [];

  if (!items.length) return { context: "", sources: [] as string[] };

  const q = (query || "").toLowerCase().trim();
  if (!q) return { context: "", sources: [] as string[] };

  const tokens = q.split(/\s+/).filter(Boolean).slice(0, 6);

  const scored = items
    .map((it) => {
      const t = (it.text || "").toLowerCase();
      let score = 0;
      for (const tok of tokens) {
        if (tok.length < 3) continue;
        if (t.includes(tok)) score += 1;
      }
      return { it, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  if (!scored.length) return { context: "", sources: [] as string[] };

  const context = scored
    .map((s) => `- (${s.it.url || "web"}) ${s.it.text || ""}`.trim())
    .join("\n");

  const sources = Array.from(new Set(scored.map((s) => s.it.url).filter(Boolean))) as string[];

  return { context, sources };
}
