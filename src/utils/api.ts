export const API_BASE = (import.meta as any).env?.VITE_API_BASE || "/api/v1";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err: any = new Error(data?.detail || res.statusText || "API error");
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}
