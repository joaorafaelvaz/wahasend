import { NextRequest, NextResponse } from "next/server";
import { wahaFetch } from "@/lib/waha-server";

export async function POST(request: NextRequest) {
  try {
    const { session, chatId, file, filename, caption, mimetype } = await request.json();
    const res = await wahaFetch("/api/sendFile", {
      method: "POST",
      body: JSON.stringify({
        session,
        chatId,
        file: { mimetype, data: file, filename },
        caption,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json({ error: data.message || "Falha ao enviar arquivo" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erro ao enviar arquivo" }, { status: 500 });
  }
}
