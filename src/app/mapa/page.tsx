"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { CITY_CENTERS } from "@/lib/cities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PetCard from "@/components/PetCard";
import { cn } from "@/lib/utils";
import type { PetReport } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const CITIES = Object.keys(CITY_CENTERS);

export default function MapaPage() {
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

      <div className="flex gap-2 px-4 pb-3">
        <Select value={cityFilter} onValueChange={(v) => setCityFilter(v ?? "todas")}>
          <SelectTrigger className="flex-1 bg-card">
            <SelectValue placeholder="Ciudad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las ciudades</SelectItem>
            {CITIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "todos")}>
          <SelectTrigger className="flex-1 bg-card">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="perdido">Perdido</SelectItem>
            <SelectItem value="encontrado">Encontrado</SelectItem>
            <SelectItem value="en_refugio">En refugio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="px-4 text-sm text-muted-foreground">Cargando…</p>
      ) : loadError ? (
        <p className="px-4 text-sm text-destructive">{loadError}</p>
      ) : filtered.length === 0 ? (
        <p className="px-4 text-sm text-muted-foreground">No hay reportes con estos filtros.</p>
      ) : view === "mapa" ? (
        <div className="h-[65vh] min-h-[420px]">
          <MapView reports={filtered} />
        </div>
      ) : (
        <ul className="flex flex-col gap-3 px-4 pb-6">
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
