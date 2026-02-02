import { NextResponse } from "next/server";
import { calcQuote, type QuoteInput } from "@/lib/pricing";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as QuoteInput;

  // Validación mínima
  if (!body?.alumnos || body.alumnos < 1) {
    return NextResponse.json({ error: "alumnos inválido" }, { status: 400 });
  }
  if (!body?.tipo || !body?.zona) {
    return NextResponse.json({ error: "faltan campos" }, { status: 400 });
  }

  const quote = calcQuote(body);
  return NextResponse.json(quote);
}
