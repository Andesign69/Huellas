"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { HeartHandshake } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

export default function SugerirRefugioPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!supabaseConfigured) {
      setError("El sitio no tiene Supabase configurado todavía.");
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase.from("shelter_suggestions").insert({
      name,
      city,
      contact,
      website: website || null,
      notes: notes || null,
    });

    if (insertError) {
      setSubmitting(false);
      setError("No se pudo enviar: " + insertError.message);
      return;
    }

    if (WEB3FORMS_KEY) {
      try {
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: `Refugio Huellas — nueva fundación sugerida: ${name}`,
            from_name: "Refugio Huellas",
            Fundación: name,
            Ciudad: city,
            Contacto: contact,
            "Sitio / Instagram": website || "—",
            Notas: notes || "—",
          }),
        });
      } catch {
        // El registro en Supabase ya quedó guardado; el correo es un aviso extra.
      }
    }

    setSubmitting(false);
    router.push("/refugios?sugerido=1");
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
