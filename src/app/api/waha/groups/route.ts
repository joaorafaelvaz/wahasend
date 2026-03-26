import { NextRequest, NextResponse } from "next/server";
import { wahaFetch } from "@/lib/waha-server";

export async function GET(request: NextRequest) {
  try {
    const session = request.nextUrl.searchParams.get("session");
    if (!session) {
      return NextResponse.json({ error: "Sessão é obrigatória" }, { status: 400 });
    }
    const res = await wahaFetch(`/api/${encodeURIComponent(session)}/groups`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json({ error: data.message || "Falha ao listar grupos" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar grupos" }, { status: 500 });
  }
}
