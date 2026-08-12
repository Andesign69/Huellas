"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { CITY_CENTERS } from "@/lib/cities";
import type { PetReport } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const CITIES = Object.keys(CITY_CENTERS);

const STATUS_LABEL: Record<string, string> = {
  perdido: "Perdido",
  encontrado: "Encontrado",
  en_refugio: "En refugio",
};

export default function HomePage() {
  const [reports, setReports] = useState<PetReport[]>([]);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(
    supabaseConfigured ? null : "Falta configurar Supabase (.env.local)."
  );
  const [cityFilter, setCityFilter] = useState("todas");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [view, setView] = useState<"lista" | "mapa">("lista");

  useEffect(() => {
    if (!supabaseConfigured) return;
    supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
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

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (cityFilter !== "todas" && r.city !== cityFilter) return false;
      if (statusFilter !== "todos" && r.status !== statusFilter) return false;
      return true;
    });
  }, [reports, cityFilter, statusFilter]);

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 p-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Huellas</h1>
          <p className="text-sm text-neutral-500">
            Mascotas perdidas o encontradas tras el sismo del 10 de agosto
          </p>
        </div>
        <Link
          href="/reportar"
          className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
        >
          + Reportar mascota
        </Link>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 p-3 text-sm">
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="rounded border border-neutral-300 px-2 py-1"
        >
          <option value="todas">Todas las ciudades</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border border-neutral-300 px-2 py-1"
        >
          <option value="todos">Todos los estados</option>
          <option value="perdido">Perdido</option>
          <option value="encontrado">Encontrado</option>
          <option value="en_refugio">En refugio</option>
        </select>
        <div className="ml-auto flex gap-1">
          <button
            onClick={() => setView("lista")}
            className={`rounded px-3 py-1 ${view === "lista" ? "bg-neutral-900 text-white" : "border border-neutral-300"}`}
          >
            Lista
          </button>
          <button
            onClick={() => setView("mapa")}
            className={`rounded px-3 py-1 ${view === "mapa" ? "bg-neutral-900 text-white" : "border border-neutral-300"}`}
          >
            Mapa
          </button>
        </div>
      </div>

      {loading ? (
        <p className="p-6 text-neutral-500">Cargando reportes…</p>
      ) : loadError ? (
        <p className="p-6 text-red-600">
          No se pudieron cargar los reportes: {loadError}. Revisa que .env.local tenga las credenciales de Supabase.
        </p>
      ) : view === "mapa" ? (
        <div className="h-[70vh] min-h-[500px]">
          <MapView reports={filtered} />
        </div>
      ) : (
        <ul className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 && (
            <p className="text-neutral-500">No hay reportes todavía con estos filtros.</p>
          )}
          {filtered.map((r) => (
            <li key={r.id} className="rounded-lg border border-neutral-200 p-3">
              {r.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.photo_url}
                  alt={r.species}
                  className="mb-2 h-40 w-full rounded object-cover"
                />
              )}
              <p className="font-semibold capitalize">
                {r.species} · {STATUS_LABEL[r.status]}
              </p>
              <p className="text-sm text-neutral-500">{r.city}</p>
              {r.description && <p className="mt-1 text-sm">{r.description}</p>}
              <p className="mt-2 text-xs text-neutral-400">
                {new Date(r.created_at).toLocaleString("es-CO")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
