import { NextRequest, NextResponse } from "next/server";
import { wahaFetch } from "@/lib/waha-server";

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    const res = await wahaFetch("/api/sessions", {
      method: "POST",
      body: JSON.stringify({
        name,
        start: true,
        config: {
          noweb: {
            store: {
              enabled: true,
              fullSync: true,
            },
          },
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Falha ao criar sessão" }, { status: res.status });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erro interno ao criar sessão" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const name = request.nextUrl.searchParams.get("name");
    const res = await wahaFetch("/api/sessions");
    const sessions = await res.json();

    if (name && Array.isArray(sessions)) {
      const session = sessions.find((s: { name: string }) => s.name === name);
      if (!session) {
        return NextResponse.json({ status: "NOT_FOUND" });
      }
      return NextResponse.json({ status: session.status, name: session.name });
    }

    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar sessões" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const name = request.nextUrl.searchParams.get("name");
    if (!name) {
      return NextResponse.json({ error: "Nome da sessão é obrigatório" }, { status: 400 });
    }
    const res = await wahaFetch(`/api/sessions/${encodeURIComponent(name)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json({ error: data.message || "Falha ao deletar sessão" }, { status: res.status });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao deletar sessão" }, { status: 500 });
  }
}
