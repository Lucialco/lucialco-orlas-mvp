// lib/rag.ts
export async function retrieveContext(_query: string, _topK = 6) {
  return { context: "", sources: [] as string[] };
}

