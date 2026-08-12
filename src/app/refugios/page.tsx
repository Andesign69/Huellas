"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Heart, Phone, MapPin, Globe, HeartHandshake, CheckCircle2 } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { Shelter } from "@/lib/types";

function SugeridoBanner() {
  const searchParams = useSearchParams();
  if (!searchParams.get("sugerido")) return null;
  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl bg-tertiary p-3 text-sm text-tertiary-foreground">
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      ¡Gracias! La revisamos y la agregamos pronto a la lista.
    </div>
  );
}

export default function RefugiosPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [error, setError] = useState<string | null>(
    supabaseConfigured ? null : "Falta configurar Supabase (.env.local)."
  );

  useEffect(() => {
    if (!supabaseConfigured) return;
    supabase
      .from("shelters")
      .select("*")
      .order("city", { ascending: true })
      .then(
        ({ data, error }) => {
          if (error) setError(error.message);
          else setShelters((data ?? []) as Shelter[]);
          setLoading(false);
        },
        (err: unknown) => {
          setError(err instanceof Error ? err.message : "Error de red.");
          setLoading(false);
        }
      );
  }, []);

  return (
    <main className="flex flex-1 flex-col px-4 pt-5">
      <header className="mb-1 flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary" />
        <h1 className="font-heading text-xl font-bold">Refugios y fundaciones</h1>
      </header>
      <p className="mb-4 text-sm text-muted-foreground">
        Organizaciones que están recibiendo o atendiendo mascotas afectadas por el sismo.
      </p>

      <Suspense fallback={null}>
        <SugeridoBanner />
      </Suspense>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : shelters.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay refugios registrados.</p>
      ) : (
        <ul className="flex flex-col gap-3 pb-6">
          {shelters.map((s) => (
            <li key={s.id} className="rounded-2xl border border-border bg-card p-4">
              <p className="font-heading font-bold">{s.name}</p>
              <p className="text-sm text-muted-foreground">
                {s.city}
                {s.zone ? ` · ${s.zone}` : ""}
              </p>
              {s.notes && <p className="mt-1 text-sm">{s.notes}</p>}
              {s.address && (
                <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {s.address}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {s.contact && (
                  <a
                    href={`tel:${s.contact.replace(/[^\d+]/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {s.contact}
                  </a>
                )}
                {s.website && (
                  <a
                    href={s.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Sitio / Instagram
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mb-6 flex flex-col items-start gap-2 rounded-2xl border border-dashed border-border p-4">
        <HeartHandshake className="h-5 w-5 text-primary" />
        <p className="text-sm font-semibold">¿Conoces una fundación recibiendo animales rescatados?</p>
        <p className="text-sm text-muted-foreground">
          Infórmanos para revisarla y agregarla a esta lista.
        </p>
        <Link
          href="/refugios/sugerir"
          className="mt-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Sugerir un refugio
        </Link>
      </div>
    </main>
  );
}
