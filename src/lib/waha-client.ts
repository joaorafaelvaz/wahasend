export async function createSession(name: string): Promise<void> {
  const res = await fetch("/api/waha/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Falha ao criar sessão");
  }
}

export async function deleteSession(name: string): Promise<void> {
  await fetch(`/api/waha/sessions?name=${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
}

export async function getSessionStatus(name: string): Promise<string> {
  const res = await fetch(`/api/waha/sessions?name=${encodeURIComponent(name)}`);
  if (!res.ok) return "UNKNOWN";
  const data = await res.json();
  return data.status || "UNKNOWN";
}

export async function getQrCode(session: string): Promise<string> {
  const res = await fetch(`/api/waha/auth/qr?session=${encodeURIComponent(session)}`);
  if (!res.ok) {
    throw new Error("Falha ao obter QR code");
  }
  const data = await res.json();
  return data.qr;
}

export async function checkNumber(session: string, phone: string): Promise<boolean> {
  const res = await fetch(
    `/api/waha/contacts/check?session=${encodeURIComponent(session)}&phone=${encodeURIComponent(phone)}`
  );
  if (!res.ok) return false;
  const data = await res.json();
  return data.numberExists === true;
}

export async function sendTextMessage(
  session: string,
  chatId: string,
  text: string
): Promise<void> {
  const res = await fetch("/api/waha/messages/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session, chatId, text }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Falha ao enviar mensagem");
  }
}

export async function sendImageMessage(
  session: string,
  chatId: string,
  base64: string,
  caption: string,
  mimetype: string
): Promise<void> {
  const res = await fetch("/api/waha/messages/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session, chatId, file: base64, caption, mimetype }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Falha ao enviar imagem");
  }
}

export async function sendFileMessage(
  session: string,
  chatId: string,
  base64: string,
  filename: string,
  caption: string,
  mimetype: string
): Promise<void> {
  const res = await fetch("/api/waha/messages/file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session, chatId, file: base64, filename, caption, mimetype }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Falha ao enviar arquivo");
  }
}

export function formatPhoneForChat(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `${digits}@c.us`;
}

export function renderMessage(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}
