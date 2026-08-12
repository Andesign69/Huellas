"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, PawPrint, MessageCircle } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/time";
import type { PetReport } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const STATUS_LABEL: Record<string, string> = {
  perdido: "Perdido",
  encontrado: "Encontrado",
  en_refugio: "En refugio",
};

const SPECIES_LABEL: Record<string, string> = {
  perro: "Perro",
  gato: "Gato",
  otro: "Mascota",
};

function whatsappLink(contact: string, text: string) {
  const digits = contact.replace(/[^\d]/g, "");
  return `https://wa.me/${digits.startsWith("57") ? digits : "57" + digits}?text=${encodeURIComponent(text)}`;
}

export default function MascotaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<PetReport | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [error, setError] = useState<string | null>(
    supabaseConfigured ? null : "Falta configurar Supabase (.env.local)."
  );

  useEffect(() => {
    if (!supabaseConfigured) return;
    supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(
        ({ data, error }) => {
          if (error) setError(error.message);
          else if (!data) setError("Este reporte ya no existe.");
          else setReport(data as PetReport);
          setLoading(false);
        },
        (err: unknown) => {
          setError(err instanceof Error ? err.message : "Error de red.");
          setLoading(false);
        }
      );
  }, [id]);

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center gap-3 px-4 pb-2 pt-5">
        <Link href="/" className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="font-heading text-lg font-bold">Refugio Huellas</span>
      </header>

      {loading ? (
        <p className="px-4 text-sm text-muted-foreground">Cargando…</p>
      ) : error ? (
        <p className="px-4 text-sm text-destructive">{error}</p>
      ) : report ? (
        <>
          <div className="relative mx-4 h-72 overflow-hidden rounded-2xl bg-muted">
            {report.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={report.photo_url}
                alt={report.name || SPECIES_LABEL[report.species]}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <PawPrint className="h-14 w-14" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <Badge variant={report.status === "perdido" ? "destructive" : "default"} className="mb-2">
                {STATUS_LABEL[report.status]}
              </Badge>
              <p className="font-heading text-2xl font-extrabold text-white">
                {report.name?.trim() || SPECIES_LABEL[report.species]}
              </p>
              <p className="text-sm text-white/85">
                {SPECIES_LABEL[report.species]}
                {report.breed ? ` · ${report.breed}` : ""}
                {report.sex ? ` · ${report.sex === "macho" ? "Macho" : "Hembra"}` : ""}
              </p>
            </div>
          </div>

          <div className="mx-4 mt-4 rounded-2xl border border-border bg-card p-4">
            <h2 className="font-heading text-lg font-bold text-primary">Detalles</h2>
            <dl className="mt-2 flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Ciudad</dt>
                <dd className="text-right font-medium">{report.city}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Reportado</dt>
                <dd className="text-right font-medium">{timeAgo(report.created_at)}</dd>
              </div>
            </dl>
            {report.description && (
              <>
                <hr className="my-3 border-border" />
                <h3 className="mb-1 text-sm font-semibold">Descripción</h3>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </>
            )}
          </div>

          <div className="mx-4 mt-4 h-56 overflow-hidden rounded-2xl border border-border">
            <MapView reports={[report]} />
          </div>

          <div className="sticky bottom-20 mx-4 mt-4 mb-6">
            <a
              href={whatsappLink(
                report.contact,
                report.status === "perdido"
                  ? `Hola, vi tu reporte de ${report.name?.trim() || SPECIES_LABEL[report.species]} en Refugio Huellas.`
                  : `Hola, creo que ${report.name?.trim() || "esta mascota"} que reportaste encontrada en Refugio Huellas es mía.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary py-3.5 font-semibold text-secondary-foreground shadow-sm"
            >
              <MessageCircle className="h-5 w-5" />
              {report.status === "perdido" ? "Contactar" : "Soy el dueño"}
            </a>
          </div>
        </>
      ) : null}
    </main>
  );
}
