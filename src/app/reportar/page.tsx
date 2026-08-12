"use client";

import { useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { CITY_CENTERS } from "@/lib/cities";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

const CITIES = Object.keys(CITY_CENTERS);

export default function ReportarPage() {
  const router = useRouter();
  const [city, setCity] = useState(CITIES[0]);
  const [species, setSpecies] = useState("perro");
  const [status, setStatus] = useState("perdido");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!supabaseConfigured) {
      setError("El sitio no tiene Supabase configurado todavía (.env.local). Avísale a quien lo esté armando.");
      return;
    }
    if (!pos) {
      setError("Toca el mapa para marcar dónde se vio o se perdió la mascota.");
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

    const { error: insertError } = await supabase.from("reports").insert({
      species,
      status,
      city,
      description: description || null,
      contact,
      photo_url,
      lat: pos.lat,
      lng: pos.lng,
    });

    setSubmitting(false);

    if (insertError) {
      setError("No se pudo guardar el reporte: " + insertError.message);
      return;
    }

    router.push("/");
  }

  return (
    <main className="mx-auto w-full max-w-lg flex-1 p-4">
      <h1 className="mb-1 text-xl font-bold tracking-tight">Reportar mascota</h1>
      <p className="mb-4 text-sm text-neutral-500">
        Toda la información que pongas aquí es pública y visible para cualquiera que esté buscando.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Ciudad
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded border border-neutral-300 px-2 py-2 font-normal"
          >
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Especie
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="rounded border border-neutral-300 px-2 py-2 font-normal"
            >
              <option value="perro">Perro</option>
              <option value="gato">Gato</option>
              <option value="otro">Otro</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Estado
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded border border-neutral-300 px-2 py-2 font-normal"
            >
              <option value="perdido">Perdido</option>
              <option value="encontrado">Encontrado</option>
              <option value="en_refugio">En refugio</option>
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Foto
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            className="font-normal"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Descripción (raza, color, collar, dónde se vio)
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded border border-neutral-300 px-2 py-2 font-normal"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Contacto (WhatsApp o teléfono)
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            className="rounded border border-neutral-300 px-2 py-2 font-normal"
          />
        </label>

        <div className="flex flex-col gap-1 text-sm font-medium">
          Ubicación — toca el mapa donde se vio o se perdió
          <LocationPicker value={pos} onChange={(lat, lng) => setPos({ lat, lng })} center={CITY_CENTERS[city]} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={submitting}
          className="rounded-full bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
        >
          {submitting ? "Guardando…" : "Publicar reporte"}
        </button>
      </form>
    </main>
  );
}
