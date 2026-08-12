"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import PillGroup from "@/components/PillGroup";
import PetCard from "@/components/PetCard";
import { cn } from "@/lib/utils";
import type { PetReport, Shelter } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "perdido", label: "Perdido" },
  { value: "encontrado", label: "Encontrado" },
  { value: "en_refugio", label: "En refugio" },
];

const SPECIES_OPTIONS = [
  { value: "todas", label: "Todas" },
  { value: "perro", label: "Perro" },
  { value: "gato", label: "Gato" },
  { value: "otro", label: "Otro" },
];

export default function MapaPage() {
  const [reports, setReports] = useState<PetReport[]>([]);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(
    supabaseConfigured ? null : "Falta configurar Supabase (.env.local)."
  );
  const [query, setQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("todas");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [speciesFilter, setSpeciesFilter] = useState("todas");
  const [view, setView] = useState<"lista" | "mapa">("lista");
  const [shelters, setShelters] = useState<Shelter[]>([]);

  useEffect(() => {
    if (!supabaseConfigured) return;
    supabase
      .from("reports")
      .select("*")
      .eq("resolved", false)
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
    supabase
      .from("shelters")
      .select("*")
      .then(({ data }) => setShelters((data ?? []) as Shelter[]));
  }, []);

  const cityOptions = useMemo(() => {
    const cities = Array.from(new Set(reports.map((r) => r.city.trim()))).sort((a, b) =>
      a.localeCompare(b, "es")
    );
    return [{ value: "todas", label: "Todas" }, ...cities.map((c) => ({ value: c, label: c }))];
  }, [reports]);

  const effectiveCityFilter = cityOptions.length > 2 ? cityFilter : "todas";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((r) => {
      if (effectiveCityFilter !== "todas" && r.city !== effectiveCityFilter) return false;
      if (statusFilter !== "todos" && r.status !== statusFilter) return false;
      if (speciesFilter !== "todas" && r.species !== speciesFilter) return false;
      if (q) {
        const haystack = `${r.name ?? ""} ${r.breed ?? ""} ${r.description ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [reports, effectiveCityFilter, statusFilter, speciesFilter, query]);

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-start justify-between gap-3 px-4 pb-3 pt-5">
        <div>
          <h1 className="font-heading text-xl font-bold">Todos los reportes</h1>
          <p className="text-sm text-muted-foreground">
            {view === "mapa" ? "Toca un pin para ver el detalle." : `${filtered.length} reporte(s)`}
          </p>
        </div>
        <div className="flex shrink-0 gap-1 rounded-full bg-muted p-1">
          {(["lista", "mapa"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                view === v ? "bg-card shadow-sm" : "text-muted-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-col gap-3 px-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, raza o descripción…"
            className="bg-card pl-9"
          />
        </div>

        {cityOptions.length > 2 && (
          <div>
            <p className="mb-1 text-xs font-semibold text-muted-foreground">Ciudad</p>
            <PillGroup value={cityFilter} onChange={setCityFilter} options={cityOptions} size="sm" />
          </div>
        )}
        <div>
          <p className="mb-1 text-xs font-semibold text-muted-foreground">Estado</p>
          <PillGroup value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} size="sm" />
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold text-muted-foreground">Especie</p>
          <PillGroup value={speciesFilter} onChange={setSpeciesFilter} options={SPECIES_OPTIONS} size="sm" />
        </div>
      </div>

      {loading ? (
        <p className="px-4 text-sm text-muted-foreground">Cargando…</p>
      ) : loadError ? (
        <p className="px-4 text-sm text-destructive">{loadError}</p>
      ) : view === "mapa" ? (
        <>
          <div className="flex items-center gap-4 px-4 pb-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full border border-white bg-destructive" />
              Reportes
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full border border-white bg-secondary" />
              Refugios
            </span>
          </div>
          <div className="h-[65vh] min-h-[420px]">
            <MapView reports={filtered} shelters={shelters} />
          </div>
        </>
      ) : filtered.length === 0 ? (
        <p className="px-4 text-sm text-muted-foreground">No hay reportes con estos filtros.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 px-4 pb-6">
          {filtered.map((r) => (
            <li key={r.id}>
              <PetCard report={r} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
