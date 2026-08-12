"use client";

import { useEffect, useState } from "react";
import { Heart, Phone } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { Shelter } from "@/lib/types";

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
              {s.contact && (
                <a
                  href={`tel:${s.contact.replace(/[^\d+]/g, "")}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {s.contact}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
