"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PawPrint, Search, HeartHandshake } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import PetCard from "@/components/PetCard";
import type { PetReport } from "@/lib/types";

export default function HomePage() {
  const [reports, setReports] = useState<PetReport[]>([]);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(
    supabaseConfigured ? null : "Falta configurar Supabase (.env.local)."
  );

  useEffect(() => {
    if (!supabaseConfigured) return;
    supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(
        ({ data, error }) => {
          if (error) setLoadError(error.message);
          else setReports((data ?? []) as PetReport[]);
          setLoading(false);
        },
        (err: unknown) => {
          setLoadError(err instanceof Error ? err.message : "Error de red al cargar reportes.");
          setLoading(false);
        }
      );
  }, []);

  return (
    <main className="flex flex-1 flex-col px-4 pt-5">
      <header className="mb-5 flex items-center gap-2">
        <PawPrint className="h-6 w-6 text-primary" />
        <span className="font-heading text-lg font-bold">Refugio Huellas</span>
      </header>

      <h1 className="font-heading text-2xl font-extrabold leading-tight text-balance">
        Estamos aquí para ayudarte a reunirte con tu mejor amigo.
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        En momentos difíciles, la comunidad se une. Reporta mascotas perdidas o encontradas tras el
        sismo y ayuda a que vuelvan a casa a salvo.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <Link
          href="/reportar?status=perdido"
          className="flex flex-col gap-3 rounded-2xl border border-border bg-tertiary p-5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-primary">
            <Search className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-heading text-lg font-bold text-tertiary-foreground">
              He perdido una mascota
            </span>
            <span className="mt-0.5 block text-sm text-tertiary-foreground/70">
              Crea un reporte detallado para que la comunidad te ayude a buscarla.
            </span>
          </span>
        </Link>

        <Link
          href="/reportar?status=encontrado"
          className="flex flex-col gap-3 rounded-2xl bg-primary p-5 text-primary-foreground"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
            <HeartHandshake className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-heading text-lg font-bold">He encontrado una mascota</span>
            <span className="mt-0.5 block text-sm text-primary-foreground/80">
              Publica la información para encontrar a su familia lo antes posible.
            </span>
          </span>
        </Link>
      </div>

      <h2 className="mb-3 mt-7 font-heading text-lg font-bold">Mascotas reportadas recientemente</h2>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando reportes…</p>
      ) : loadError ? (
        <p className="text-sm text-destructive">
          No se pudieron cargar los reportes: {loadError}. Revisa que .env.local tenga las credenciales
          de Supabase.
        </p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no hay reportes. Sé la primera persona en publicar uno.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {reports.map((r) => (
            <li key={r.id}>
              <PetCard report={r} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
