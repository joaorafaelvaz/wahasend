import { NextRequest, NextResponse } from "next/server";
import { wahaFetch } from "@/lib/waha-server";

export async function GET(request: NextRequest) {
  try {
    const session = request.nextUrl.searchParams.get("session");
    if (!session) {
      return NextResponse.json({ error: "Sessão é obrigatória" }, { status: 400 });
    }

    // Try /groups endpoint first
    let res = await wahaFetch(`/api/${encodeURIComponent(session)}/groups`);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    // Fallback: use /chats and filter groups (@g.us)
    res = await wahaFetch(`/api/${encodeURIComponent(session)}/chats`);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.message || "Falha ao listar grupos" },
        { status: res.status }
      );
    }

    const chats = await res.json();
    const groups = (Array.isArray(chats) ? chats : [])
      .filter((chat: { id: string }) => chat.id?.endsWith("@g.us"))
      .map((chat: { id: string; name?: string; participants?: { id: string }[] }) => ({
        id: chat.id,
        name: chat.name || chat.id,
        participants: chat.participants || [],
      }));

    return NextResponse.json(groups);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar grupos" }, { status: 500 });
  }
}
