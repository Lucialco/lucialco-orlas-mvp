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

function loadKB(): KB {
  if (cached) return cached;

  const p = path.join(process.cwd(), "data", "knowledge.json");
  const raw = fs.readFileSync(p, "utf8");

  cached = JSON.parse(raw);
  return cached!;
}

function dot(a: number[], b: number[]) {
  return a.reduce((s, v, i) => s + v * b[i], 0);
}

function norm(a: number[]) {
  return Math.sqrt(dot(a, a));
}

function cosine(a: number[], b: number[]) {
  return dot(a, b) / (norm(a) * norm(b) + 1e-12);
}

export async function embedQuery(q: string): Promise<number[]> {
  const r = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: q,
    }),
  });

  if (!r.ok) throw new Error(await r.text());

  const data = await r.json();
  return data.data[0].embedding as number[];
}

export async function retrieveContext(query: string, topK = 6) {
  const kb = loadKB();
  const qEmb = await embedQuery(query);

  const scored = kb.items
    .map(it => ({
      it,
      score: cosine(qEmb, it.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  const best = scored[0]?.score ?? 0;
  if (best < 0.25) {
    return { context: "", sources: [] as string[] };
  }

  const context = scored
    .map(s => `- (${s.it.url}) ${s.it.text}`)
    .join("\n");

  const sources = Array.from(new Set(scored.map(s => s.it.url)));

  return { context, sources };
}
