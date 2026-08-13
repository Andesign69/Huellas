"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { HeartHandshake } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SugerirRefugioPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [formLoadedAt] = useState(() => new Date().toISOString());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await apiFetch("/api/shelters/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          city,
          contact,
          website: website || null,
          notes: notes || null,
          honeypot: honeypot || null,
          form_loaded_at: formLoadedAt,
        }),
      });
      router.push("/refugios?sugerido=1");
    } catch (err) {
      setError("No se pudo enviar: " + (err instanceof Error ? err.message : "Error de red."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col px-4 pt-5">
      <header className="mb-1 flex items-center gap-2">
        <HeartHandshake className="h-5 w-5 text-primary" />
        <h1 className="font-heading text-xl font-bold">Sugerir un refugio</h1>
      </header>
      <p className="mb-5 text-sm text-muted-foreground">
        ¿Conoces una fundación que esté recibiendo animales rescatados por el sismo? Cuéntanos y la
        revisamos antes de agregarla a la lista.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-8">
        {/* Honeypot: invisible para personas, los bots que llenan todos los campos caen aquí. */}
        <div className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="company">No llenar este campo</label>
          <input
            id="company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="name" className="mb-1.5">
            Nombre de la fundación o refugio
          </Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="city" className="mb-1.5">
            Ciudad
          </Label>
          <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="contact" className="mb-1.5">
            Contacto (WhatsApp o teléfono de la fundación)
          </Label>
          <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="website" className="mb-1.5">
            Sitio web o Instagram (opcional)
          </Label>
          <Input
            id="website"
            placeholder="https://instagram.com/..."
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="notes" className="mb-1.5">
            ¿Qué están haciendo? (opcional)
          </Label>
          <Textarea
            id="notes"
            rows={3}
            placeholder="Ej. Están recibiendo perros y gatos rescatados, tienen capacidad para..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={submitting} className="w-full py-6 text-base">
          {submitting ? "Enviando…" : "Enviar sugerencia"}
        </Button>
      </form>
    </main>
  );
}
