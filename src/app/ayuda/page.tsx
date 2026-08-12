import Link from "next/link";
import { LifeBuoy, HandHeart, Heart, ShieldAlert, HelpCircle, ChevronRight } from "lucide-react";
import CopyButton from "@/components/CopyButton";

const VAKI_URL = "https://vaki.co/vaki/una-garra-por-colombia";
const BREB_KEY = "@andres5049";

export default function AyudaPage() {
  return (
    <main className="flex flex-1 flex-col px-4 pt-5">
      <header className="mb-1 flex items-center gap-2">
        <LifeBuoy className="h-5 w-5 text-primary" />
        <h1 className="font-heading text-xl font-bold">Ayuda</h1>
      </header>
      <p className="mb-5 text-sm text-muted-foreground">
        Sobre Rastrea Huellas, y cómo apoyar la respuesta al sismo o el mantenimiento de esta
        herramienta.
      </p>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-lg font-bold">Una Garra por Colombia</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Vaki oficial para comida, medicamentos, insumos veterinarios y reconstrucción de refugios
          para los animales afectados por el sismo.
        </p>
        <a
          href={VAKI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex w-full items-center justify-center rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Donar en Vaki
        </a>
      </section>

      <Link
        href="/como-funciona"
        className="mt-4 mb-4 flex items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3"
      >
        <span className="flex items-center gap-2">
          <HelpCircle className="h-4.5 w-4.5 text-primary" />
          <span className="text-sm font-semibold">Cómo funciona / Preguntas frecuentes</span>
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>

      <section className="mt-2 rounded-xl border border-dashed border-border p-4">
        <div className="flex items-center gap-2">
          <HandHeart className="h-4.5 w-4.5 text-muted-foreground" />
          <h2 className="text-sm font-bold text-muted-foreground">
            Apoya el desarrollo de esta herramienta
          </h2>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Esta app es 100% gratuita y sin ánimo de lucro — nadie cobra por usarla ni por reportar una
          mascota. Si quieres apoyar los costos de mantenerla en línea, puedes hacerlo por Bre-B, a
          título personal del creador. Esto es aparte y no reemplaza la ayuda oficial de arriba.
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
              Llave Bre-B
            </p>
            <p className="font-mono text-sm font-semibold">{BREB_KEY}</p>
          </div>
          <CopyButton value={BREB_KEY} />
        </div>
      </section>

      <section className="mt-4 rounded-xl p-4">
        <h2 className="text-sm font-bold text-muted-foreground">Sobre esta app</h2>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Rastrea Huellas fue creada por Andrés Martínez con ayuda de Diego Peña y Apex One para
          ayudar a reunir mascotas perdidas y encontradas tras el sismo del 10 de agosto de 2026 en
          Colombia. Es una app gratuita y sin ánimo de lucro, construida por voluntad propia para
          apoyar a la comunidad afectada. No reemplaza a las autoridades, a la Cruz Roja ni a los
          organismos oficiales de emergencia.
        </p>
      </section>

      <section className="mt-4 mb-6 flex gap-2 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <p>
          Verifica siempre que cualquier solicitud de ayuda venga directamente de una fundación,
          refugio o autoridad — durante emergencias circulan intentos de fraude aprovechando la
          buena voluntad de la gente.
        </p>
      </section>
    </main>
  );
}
