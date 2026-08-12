import { LifeBuoy, HandHeart, Heart, ShieldAlert } from "lucide-react";

export default function AyudaPage() {
  return (
    <main className="flex flex-1 flex-col px-4 pt-5">
      <header className="mb-1 flex items-center gap-2">
        <LifeBuoy className="h-5 w-5 text-primary" />
        <h1 className="font-heading text-xl font-bold">Ayuda</h1>
      </header>
      <p className="mb-5 text-sm text-muted-foreground">
        Sobre Refugio Huellas, y cómo apoyar la respuesta al sismo o el mantenimiento de esta
        herramienta.
      </p>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="font-heading font-bold">Sobre esta app</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Refugio Huellas fue creada por <strong className="text-foreground">Andrés Martínez</strong>{" "}
          para ayudar a reunir mascotas perdidas y encontradas tras el sismo del 10 de agosto de 2026
          en Colombia. Es una app <strong className="text-foreground">gratuita y sin ánimo de lucro</strong>,
          construida por voluntad propia para apoyar a la comunidad afectada.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          No reemplaza a las autoridades, a la Cruz Roja ni a los organismos oficiales de emergencia.
        </p>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-tertiary p-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-tertiary-foreground" />
          <h2 className="font-heading font-bold text-tertiary-foreground">
            Dona a la ayuda oficial del sismo
          </h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-tertiary-foreground/80">
          Vaqui oficial para la emergencia — próximamente el enlace aquí.
        </p>
        <button
          disabled
          className="mt-3 w-full rounded-full bg-card py-2.5 text-sm font-semibold text-muted-foreground opacity-60"
        >
          Enlace en camino
        </button>
      </section>

      <section className="mt-4 rounded-xl border border-dashed border-border p-4">
        <div className="flex items-center gap-2">
          <HandHeart className="h-4.5 w-4.5 text-muted-foreground" />
          <h2 className="text-sm font-bold text-muted-foreground">
            Apoya el desarrollo de esta herramienta
          </h2>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Esta app es 100% gratuita y sin ánimo de lucro — nadie cobra por usarla ni por reportar una
          mascota. Si quieres apoyar los costos de mantenerla en línea, pronto vas a poder hacerlo
          aquí. Esto es aparte y no reemplaza la ayuda oficial de arriba.
        </p>
        <button
          disabled
          className="mt-3 w-full rounded-full border border-border py-2 text-xs font-semibold text-muted-foreground opacity-60"
        >
          Enlace en camino
        </button>
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
