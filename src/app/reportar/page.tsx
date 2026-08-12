"use client";

import { useState, type FormEvent, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { LocateFixed, Info, MapPin, Camera, Megaphone } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { SUGGESTED_CITIES, centerForCity } from "@/lib/cities";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import PillGroup from "@/components/PillGroup";
import type { ReportStatus, Sex, Species } from "@/lib/types";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

const STATUS_OPTIONS: { value: ReportStatus; label: string }[] = [
  { value: "perdido", label: "Perdido" },
  { value: "encontrado", label: "Encontrado" },
  { value: "en_refugio", label: "En refugio" },
];

const SPECIES_OPTIONS: { value: Species; label: string }[] = [
  { value: "perro", label: "Perro" },
  { value: "gato", label: "Gato" },
  { value: "otro", label: "Otro" },
];

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: "macho", label: "Macho" },
  { value: "hembra", label: "Hembra" },
];

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="font-heading font-bold">{title}</h2>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function ReportarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get("status") as ReportStatus) || "perdido";

  const [status, setStatus] = useState<ReportStatus>(
    STATUS_OPTIONS.some((o) => o.value === initialStatus) ? initialStatus : "perdido"
  );
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<Species>("perro");
  const [breed, setBreed] = useState("");
  const [sex, setSex] = useState<Sex | "">("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsFocus, setGpsFocus] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [formLoadedAt] = useState(() => new Date().toISOString());

  function useMyLocation() {
    setLocationError(null);

    if (!window.isSecureContext) {
      setLocationError(
        "La ubicación solo funciona en una conexión segura (https). Toca el mapa para marcarla a mano."
      );
      return;
    }
    if (!navigator.geolocation) {
      setLocationError("Tu navegador no soporta geolocalización. Toca el mapa para marcar el punto.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const next: [number, number] = [p.coords.latitude, p.coords.longitude];
        setPos({ lat: next[0], lng: next[1] });
        setGpsFocus(next);
        setLocating(false);
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "Bloqueaste el permiso de ubicación para este sitio. Actívalo en los ajustes del navegador, o toca el mapa para marcarla a mano.",
          2: "No pudimos determinar tu ubicación (GPS apagado o sin señal). Toca el mapa para marcarla a mano.",
          3: "Se agotó el tiempo buscando tu ubicación. Intenta de nuevo o toca el mapa para marcarla a mano.",
        };
        setLocationError(messages[err.code] ?? "No pudimos acceder a tu ubicación. Toca el mapa para marcarla a mano.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!supabaseConfigured) {
      setError("El sitio no tiene Supabase configurado todavía (.env.local). Avísale a quien lo esté armando.");
      return;
    }
    if (!city.trim()) {
      setError("Dinos en qué ciudad o municipio fue.");
      return;
    }
    if (!pos) {
      setError("Usa tu ubicación actual o toca el mapa para marcar dónde se vio o se perdió.");
      return;
    }
    if (!contact.trim()) {
      setError("Deja un contacto (WhatsApp o teléfono) para que te puedan escribir.");
      return;
    }

    setSubmitting(true);

    let photo_url: string | null = null;
    if (photo) {
      const path = `${crypto.randomUUID()}-${photo.name}`;
      const { error: uploadError } = await supabase.storage.from("pet-photos").upload(path, photo);
      if (uploadError) {
        setError("No se pudo subir la foto: " + uploadError.message);
        setSubmitting(false);
        return;
      }
      photo_url = supabase.storage.from("pet-photos").getPublicUrl(path).data.publicUrl;
    }

    const { error: rpcError } = await supabase.rpc("submit_report", {
      p_name: name.trim() || null,
      p_species: species,
      p_breed: breed.trim() || null,
      p_sex: sex || null,
      p_status: status,
      p_photo_url: photo_url,
      p_lat: pos.lat,
      p_lng: pos.lng,
      p_city: city,
      p_description: description || null,
      p_contact: contact,
      p_honeypot: honeypot || null,
      p_form_loaded_at: formLoadedAt,
    });

    setSubmitting(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    router.push("/");
  }

  return (
    <main className="flex flex-1 flex-col px-4 pt-5">
      <h1 className="font-heading text-2xl font-extrabold text-balance">
        {status === "encontrado" ? "Reportar mascota encontrada" : "Reportar mascota perdida"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Mantén la calma. Entre más detalle des, más fácil es que la comunidad ayude. Todo lo que
        pongas aquí es público.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4 pb-8">
        {/* Honeypot: invisible para personas, los bots que llenan todos los campos caen aquí. */}
        <div className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="website">No llenar este campo</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <Section icon={Info} title="Información básica">
          <div>
            <Label className="mb-1.5">Estado del reporte</Label>
            <PillGroup value={status} onChange={setStatus} options={STATUS_OPTIONS} />
          </div>

          <div>
            <Label htmlFor="name" className="mb-1.5">
              Nombre de la mascota
            </Label>
            <Input id="name" placeholder="Ej. Luna, Toby" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label className="mb-1.5">Tipo de animal</Label>
            <PillGroup value={species} onChange={setSpecies} options={SPECIES_OPTIONS} />
          </div>

          <div>
            <Label htmlFor="breed" className="mb-1.5">
              Raza (o apariencia general)
            </Label>
            <Input
              id="breed"
              placeholder="Ej. Mestizo tamaño mediano"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-1.5">Sexo</Label>
            <PillGroup value={sex} onChange={setSex} options={SEX_OPTIONS} allowDeselect />
          </div>
        </Section>

        <Section icon={MapPin} title="¿Dónde lo viste por última vez?">
          <div>
            <Label htmlFor="city" className="mb-1.5">
              Ciudad o municipio
            </Label>
            <Input
              id="city"
              list="city-suggestions"
              placeholder="Ej. Pereira, Dosquebradas, Armenia…"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <datalist id="city-suggestions">
              {SUGGESTED_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={useMyLocation}
            disabled={locating}
          >
            <LocateFixed className="h-4 w-4" />
            {locating ? "Buscando tu ubicación…" : "Usar mi ubicación actual"}
          </Button>
          {locationError && <p className="text-sm text-destructive">{locationError}</p>}

          <div>
            <Label className="mb-1.5">Ajusta el punto exacto en el mapa</Label>
            <LocationPicker
              value={pos}
              onChange={(lat, lng) => setPos({ lat, lng })}
              center={centerForCity(city)}
              flyTo={gpsFocus}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Una ubicación precisa ayuda a los voluntarios de la zona a enfocar la búsqueda.
          </p>
        </Section>

        <Section icon={Camera} title="Detalles y foto">
          <div>
            <Label className="mb-1.5">Sube una foto clara (opcional pero muy útil)</Label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-muted/40 py-6 text-center">
              <Camera className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium">
                {photo ? photo.name : "Toca para subir una imagen"}
              </span>
              <span className="text-xs text-muted-foreground">Formatos recomendados: JPG, PNG</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div>
            <Label htmlFor="description" className="mb-1.5">
              Características distintivas
            </Label>
            <Textarea
              id="description"
              placeholder="Ej. Tiene un collar rojo, una mancha blanca en el ojo derecho, es muy asustadizo"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="contact" className="mb-1.5">
              Contacto (WhatsApp o teléfono)
            </Label>
            <Input
              id="contact"
              placeholder="Ej. 3001234567"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>
        </Section>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <p className="text-center text-xs text-muted-foreground">
          Al publicar, tu reporte será visible para cualquiera que visite Rastrea Huellas.
        </p>

        <Button type="submit" disabled={submitting} className="w-full py-6 text-base">
          <Megaphone className="h-4 w-4" />
          {submitting ? "Publicando…" : "Publicar reporte"}
        </Button>
      </form>
    </main>
  );
}

export default function ReportarPage() {
  return (
    <Suspense fallback={null}>
      <ReportarForm />
    </Suspense>
  );
}
