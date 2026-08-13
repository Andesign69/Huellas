"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, PawPrint, MessageCircle, CheckCircle2, Flag, Share2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { timeAgo } from "@/lib/time";
import { getResolveToken } from "@/lib/resolveTokens";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingResolve, setConfirmingResolve] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [flagging, setFlagging] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagHoneypot, setFlagHoneypot] = useState("");
  const [flagLoadedAt, setFlagLoadedAt] = useState<string | null>(null);
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const [flagError, setFlagError] = useState<string | null>(null);
  const [flagSubmitted, setFlagSubmitted] = useState(false);
  const [resolveToken] = useState<string | null>(() => getResolveToken(id));
  const [shared, setShared] = useState(false);

  async function handleShare() {
    if (!report) return;
    const displayName = report.name?.trim() || SPECIES_LABEL[report.species];
    const statusText =
      report.status === "perdido" ? "Se busca" : report.status === "encontrado" ? "Se encontró" : "En refugio";
    const text = `${statusText}: ${displayName} en ${report.city}. Ayúdanos a difundir en Rastrea Huellas.`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Rastrea Huellas", text, url });
      } catch {
        // el usuario canceló el share, no hay nada que hacer
      }
      return;
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setShared(true);
        setTimeout(() => setShared(false), 1800);
        return;
      } catch {
        // sigue al fallback de abrir WhatsApp
      }
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank", "noopener,noreferrer");
  }

  async function handleFlag() {
    if (!report) return;
    setFlagSubmitting(true);
    setFlagError(null);
    try {
      await apiFetch(`/api/reports/${report.id}/flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: flagReason.trim() || null,
          honeypot: flagHoneypot || null,
          form_loaded_at: flagLoadedAt,
        }),
      });
      setFlagSubmitted(true);
      setFlagging(false);
    } catch (err) {
      setFlagError("No se pudo enviar: " + (err instanceof Error ? err.message : "Error de red."));
    } finally {
      setFlagSubmitting(false);
    }
  }

  async function handleResolve() {
    if (!report || !resolveToken) return;
    setResolving(true);
    setResolveError(null);
    try {
      await apiFetch(`/api/reports/${report.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resolveToken }),
      });
      setReport({ ...report, resolved: true });
      setConfirmingResolve(false);
    } catch (err) {
      setResolveError("No se pudo actualizar: " + (err instanceof Error ? err.message : "Error de red."));
    } finally {
      setResolving(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    apiFetch<PetReport>(`/api/reports/${id}`)
      .then((data) => {
        if (cancelled) return;
        setReport(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Error de red.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-3 px-4 pb-2 pt-5">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="font-heading text-lg font-bold">Rastrea Huellas</span>
        </div>
        {report && (
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-foreground"
          >
            <Share2 className="h-3.5 w-3.5" />
            {shared ? "Copiado" : "Compartir"}
          </button>
        )}
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

          <div className="mx-4 mt-3">
            {flagSubmitted ? (
              <p className="text-center text-xs text-muted-foreground">
                Gracias, vamos a revisar este reporte.
              </p>
            ) : flagging ? (
              <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3">
                <p className="text-sm font-semibold">¿Qué tiene de malo este reporte?</p>
                {/* Honeypot: invisible para personas, los bots que llenan todos los campos caen aquí. */}
                <div className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
                  <label htmlFor="flag-website">No llenar este campo</label>
                  <input
                    id="flag-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={flagHoneypot}
                    onChange={(e) => setFlagHoneypot(e.target.value)}
                  />
                </div>
                <Textarea
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="Opcional: cuéntanos qué está mal (spam, información falsa, foto inapropiada...)"
                  rows={2}
                />
                {flagError && <p className="text-xs text-destructive">{flagError}</p>}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setFlagging(false)}
                    disabled={flagSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="button" className="flex-1" onClick={handleFlag} disabled={flagSubmitting}>
                    {flagSubmitting ? "Enviando…" : "Enviar reporte"}
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setFlagging(true);
                  setFlagLoadedAt(new Date().toISOString());
                }}
                className="flex w-full items-center justify-center gap-1.5 py-1 text-center text-xs font-medium text-muted-foreground underline underline-offset-2"
              >
                <Flag className="h-3 w-3" />
                Reportar contenido inapropiado
              </button>
            )}
          </div>

          {report.resolved ? (
            <div className="mx-4 mt-4 mb-6 flex items-center gap-2 rounded-2xl bg-tertiary p-4 text-tertiary-foreground">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p className="text-sm font-semibold">
                Este reporte ya se marcó como resuelto — la mascota está en casa.
              </p>
            </div>
          ) : (
            <div className="mx-4 mt-4 mb-6 flex flex-col gap-2">
              <a
                href={whatsappLink(
                  report.contact,
                  report.status === "perdido"
                    ? `Hola, vi tu reporte de ${report.name?.trim() || SPECIES_LABEL[report.species]} en Rastrea Huellas.`
                    : `Hola, creo que ${report.name?.trim() || "esta mascota"} que reportaste encontrada en Rastrea Huellas es mía.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary py-3.5 font-semibold text-secondary-foreground shadow-sm"
              >
                <MessageCircle className="h-5 w-5" />
                {report.status === "perdido" ? "Contactar" : "Soy el dueño"}
              </a>

              {resolveToken &&
                (confirmingResolve ? (
                  <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3">
                    <p className="text-center text-sm">¿Ya está en casa? Esto lo quita de los reportes.</p>
                    {resolveError && <p className="text-center text-xs text-destructive">{resolveError}</p>}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setConfirmingResolve(false)}
                        disabled={resolving}
                      >
                        Cancelar
                      </Button>
                      <Button type="button" className="flex-1" onClick={handleResolve} disabled={resolving}>
                        {resolving ? "Guardando…" : "Sí, marcar resuelto"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingResolve(true)}
                    className="py-1.5 text-center text-xs font-medium text-muted-foreground underline underline-offset-2"
                  >
                    Marcar como resuelto
                  </button>
                ))}
            </div>
          )}
        </>
      ) : null}
    </main>
  );
}
