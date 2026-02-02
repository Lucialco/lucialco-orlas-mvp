import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Chatbot retirado" },
    { status: 410 }
  );
}
