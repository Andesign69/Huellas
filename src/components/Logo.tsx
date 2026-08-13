export default function Logo({ className }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- SVG vector asset, no benefit from next/image's raster optimizer
  return <img src="/logo.svg" alt="Rastrea Huellas" width={1672} height={594} className={className} />;
}
