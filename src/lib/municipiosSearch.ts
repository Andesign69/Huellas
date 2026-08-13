import { MUNICIPIOS, type Municipio } from "@/lib/municipios";

export function normalizeText(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const INDEXED = MUNICIPIOS.map((m) => ({ m, key: normalizeText(m.name) }));

// Coincidencia exacta (normalizada) — para saber si lo que el usuario escribió
// ya es un municipio real, sin pasar por el dropdown.
export function findMunicipio(name: string): Municipio | null {
  const key = normalizeText(name);
  return INDEXED.find((r) => r.key === key)?.m ?? null;
}

export function searchMunicipios(query: string, limit = 8): Municipio[] {
  const key = normalizeText(query);
  if (!key) return [];
  const results: Municipio[] = [];
  for (const { m, key: mKey } of INDEXED) {
    if (mKey.includes(key)) {
      results.push(m);
      if (results.length >= limit) break;
    }
  }
  return results;
}
