import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function retrieveContext(query: string, _topK = 6) {
  if (!process.env.OPENAI_API_KEY) {
    return { context: "", sources: [] as string[] };
  }

  // De momento no usamos RAG real: solo dejamos pasar la pregunta
  // para que el backend confirme que OpenAI funciona.
  return {
    context: query,
    sources: [],
  };
}
