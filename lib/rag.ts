// lib/rag.ts
export async function retrieveContext(query: string, _topK = 6) {
  return { context: query || "", sources: [] as string[] };
}
