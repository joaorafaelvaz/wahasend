import { NextRequest, NextResponse } from "next/server";
import { wahaFetch } from "@/lib/waha-server";

interface ChatItem {
  id: string;
  name?: string;
  subject?: string;
  participants?: { id: string }[];
  size?: number;
}

function normalizeGroups(data: ChatItem[]): { id: string; name: string; participants: { id: string }[] }[] {
  return data
    .filter((item) => item.id?.endsWith("@g.us"))
    .map((item) => ({
      id: item.id,
      name: item.name || item.subject || item.id,
      participants: item.participants || [],
    }));
}

export async function GET(request: NextRequest) {
  try {
    const session = request.nextUrl.searchParams.get("session");
    if (!session) {
      return NextResponse.json({ error: "Sessão é obrigatória" }, { status: 400 });
    }

    const encodedSession = encodeURIComponent(session);

    // Strategy 1: GET /api/{session}/groups
    try {
      const res = await wahaFetch(`/api/${encodedSession}/groups`);
      if (res.ok) {
        const data = await res.json();
        const groups = Array.isArray(data) ? normalizeGroups(data) : [];
        if (groups.length > 0) {
          return NextResponse.json(groups);
        }
      }
    } catch {
      // Continue to next strategy
    }

    // Strategy 2: GET /api/{session}/groups/getAll
    try {
      const res = await wahaFetch(`/api/${encodedSession}/groups/getAll`);
      if (res.ok) {
        const data = await res.json();
        const groups = Array.isArray(data) ? normalizeGroups(data) : [];
        if (groups.length > 0) {
          return NextResponse.json(groups);
        }
      }
    } catch {
      // Continue to next strategy
    }

    // Strategy 3: GET /api/{session}/chats (filter @g.us)
    try {
      const res = await wahaFetch(`/api/${encodedSession}/chats`);
      if (res.ok) {
        const data = await res.json();
        const groups = Array.isArray(data) ? normalizeGroups(data) : [];
        if (groups.length > 0) {
          return NextResponse.json(groups);
        }
      }
    } catch {
      // Continue to next strategy
    }

    // Strategy 4: GET /api/contacts/all with session param (filter @g.us)
    try {
      const res = await wahaFetch(`/api/contacts/all?session=${encodedSession}`);
      if (res.ok) {
        const data = await res.json();
        const groups = Array.isArray(data) ? normalizeGroups(data) : [];
        if (groups.length > 0) {
          return NextResponse.json(groups);
        }
      }
    } catch {
      // Continue
    }

    // None returned results — return empty array (sync might still be in progress)
    return NextResponse.json([]);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar grupos" }, { status: 500 });
  }
}
