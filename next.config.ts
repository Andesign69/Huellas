import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // react-leaflet no tolera el doble montaje de Strict Mode (falla con
  // "Map container is being reused by another instance"). Solo afecta
  // desarrollo: Strict Mode no hace nada en el build de producción.
  reactStrictMode: false,
  // pg hace requires dinámicos para su dependencia opcional pg-native;
  // sin esto el bundler intenta empaquetarlos y falla en build.
  serverExternalPackages: ["pg"],
};

export default nextConfig;
