"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PawPrint, Search, HeartHandshake, ArrowRight } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import PetCard from "@/components/PetCard";
import type { PetReport } from "@/lib/types";

const PREVIEW_COUNT = 6;

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
      .eq("resolved", false)
      .order("created_at", { ascending: false })
      .limit(PREVIEW_COUNT)
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

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link
          href="/reportar?status=perdido"
          className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-tertiary p-4"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-primary">
            <Search className="h-4.5 w-4.5" />
          </span>
          <span className="font-heading text-base font-bold leading-tight text-tertiary-foreground">
            Perdí una mascota
          </span>
        </Link>

        <Link
          href="/reportar?status=encontrado"
          className="flex flex-col items-start gap-2 rounded-2xl bg-primary p-4 text-primary-foreground"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <HeartHandshake className="h-4.5 w-4.5" />
          </span>
          <span className="font-heading text-base font-bold leading-tight">Encontré una mascota</span>
        </Link>
      </div>

      <div className="mb-3 mt-7 flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold">Reportados recientemente</h2>
        <Link href="/mapa" className="flex items-center gap-0.5 text-sm font-medium text-primary">
          Ver todos
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

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
        <ul className="grid grid-cols-2 gap-3">
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
