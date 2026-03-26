import { NextRequest, NextResponse } from "next/server";
import { wahaFetch } from "@/lib/waha-server";

export async function POST(request: NextRequest) {
  try {
    const { session, chatId, text } = await request.json();
    const res = await wahaFetch("/api/sendText", {
      method: "POST",
      body: JSON.stringify({ session, chatId, text }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json({ error: data.message || "Falha ao enviar mensagem" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 500 });
  }
}
