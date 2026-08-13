export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || "Error de red.");
  }
  return data as T;
}
