const WAHA_API_URL = process.env.WAHA_API_URL || "http://localhost:3001";
const WAHA_API_KEY = process.env.WAHA_API_KEY || "";

function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Api-Key": WAHA_API_KEY,
  };
}

export async function wahaFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${WAHA_API_URL}${path}`;
  return fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });
}
