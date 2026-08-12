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
      <header className="px-4 pb-3 pt-5">
        <h1 className="font-heading text-xl font-bold">Mapa de reportes</h1>
        <p className="text-sm text-muted-foreground">Toca un pin para ver el detalle.</p>
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
      ) : (
        <div className="h-[65vh] min-h-[420px] flex-1">
          <MapView reports={filtered} />
        </div>
      )}
    </main>
  );
}
