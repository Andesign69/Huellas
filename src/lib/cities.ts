// Coordenadas de referencia para centrar el mapa. No es una lista cerrada de
// ciudades válidas — el campo "Ciudad" del formulario es texto libre, esto
// solo ayuda a centrar el mapa cuando el nombre coincide con algo conocido.
export const CITY_CENTERS: Record<string, [number, number]> = {
  Pereira: [4.8133, -75.6961],
  Cali: [3.4516, -76.532],
  Manizales: [5.0689, -75.5174],
  Quibdó: [5.6947, -76.6612],
  Armenia: [4.5339, -75.6811],
  Dosquebradas: [4.8375, -75.6698],
  Villamaría: [5.0464, -75.5108],
  Buenaventura: [3.8801, -77.0313],
  Cartago: [4.7462, -75.9107],
  "La Virginia": [4.8994, -75.8794],
  Chinchiná: [4.9836, -75.6058],
  Sevilla: [4.2686, -75.9364],
  Palmira: [3.5322, -76.303],
};

// Ciudades sugeridas al reportar (autocompletado, no restringe el texto libre).
export const SUGGESTED_CITIES = Object.keys(CITY_CENTERS);

export const DEFAULT_CENTER: [number, number] = [4.6, -76.0];

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const NORMALIZED_CENTERS: Record<string, [number, number]> = Object.fromEntries(
  Object.entries(CITY_CENTERS).map(([city, coords]) => [normalize(city), coords])
);

export function centerForCity(city: string): [number, number] {
  return NORMALIZED_CENTERS[normalize(city)] ?? DEFAULT_CENTER;
}
