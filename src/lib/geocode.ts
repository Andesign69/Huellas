// Respaldo para ciudades/veredas que no están en la lista oficial de
// municipios (src/lib/municipios.ts) — solo centra el mapa, el punto exacto
// lo sigue poniendo la persona (GPS o tap). Nominatim es de uso libre para
// bajo volumen sin llave; ver https://operations.osmfoundation.org/policies/nominatim/
export async function geocodeCity(
  query: string,
  signal?: AbortSignal
): Promise<{ lat: number; lng: number } | null> {
  const q = query.trim();
  if (!q) return null;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=co&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const results: { lat: string; lon: string }[] = await res.json();
    const first = results[0];
    if (!first) return null;
    return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
  } catch {
    // abort del debounce, sin red, o respuesta inesperada — el mapa
    // simplemente se queda en su centro por defecto, no es fatal.
    return null;
  }
}
