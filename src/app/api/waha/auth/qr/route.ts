import { NextRequest, NextResponse } from "next/server";
import { wahaFetch } from "@/lib/waha-server";

export async function GET(request: NextRequest) {
  try {
    const session = request.nextUrl.searchParams.get("session");
    if (!session) {
      return NextResponse.json({ error: "Sessão é obrigatória" }, { status: 400 });
    }
    const res = await wahaFetch(`/api/${encodeURIComponent(session)}/auth/qr`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Falha ao obter QR code" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json({ qr: data.value || data.data || data });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar QR code" }, { status: 500 });
  }
}
