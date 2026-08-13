import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // react-leaflet no tolera el doble montaje de Strict Mode (falla con
  // "Map container is being reused by another instance"). Solo afecta
  // desarrollo: Strict Mode no hace nada en el build de producción.
  reactStrictMode: false,
  // pg hace requires dinámicos para su dependencia opcional pg-native;
  // sin esto el bundler intenta empaquetarlos y falla en build.
  serverExternalPackages: ["pg"],
  // Build de salida mínima para Docker (WBS Chapter 7) — solo el código y
  // los node_modules realmente usados en runtime, no el repo completo.
  output: "standalone",
};

export default nextConfig;
