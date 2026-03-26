import { NextRequest, NextResponse } from "next/server";
import { wahaFetch } from "@/lib/waha-server";

export async function GET(request: NextRequest) {
  try {
    const session = request.nextUrl.searchParams.get("session");
    const phone = request.nextUrl.searchParams.get("phone");
    if (!session || !phone) {
      return NextResponse.json({ error: "Sessão e telefone são obrigatórios" }, { status: 400 });
    }
    const res = await wahaFetch(
      `/api/contacts/check-exists?phone=${encodeURIComponent(phone)}&session=${encodeURIComponent(session)}`
    );
    if (!res.ok) {
      return NextResponse.json({ numberExists: false });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ numberExists: false });
  }
}
