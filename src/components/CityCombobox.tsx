"use client";

import { useId, useRef, useState } from "react";
import { Check, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { findMunicipio, searchMunicipios } from "@/lib/municipiosSearch";
import type { Municipio } from "@/lib/municipios";

export default function CityCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (city: string, coords: { lat: number; lng: number } | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const listboxId = useId();
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = open ? searchMunicipios(value) : [];
  const exactMatch = findMunicipio(value);
  // Solo ofrecemos "usar tal cual" cuando lo escrito no es ninguno de los
  // resultados que ya se muestran — si empatan, seleccionarlo alcanza.
  const showFreeTextOption = open && value.trim().length > 1 && !exactMatch;

  function selectMunicipio(m: Municipio) {
    onChange(m.name, { lat: m.lat, lng: m.lng });
    setOpen(false);
  }

  function selectFreeText() {
    onChange(value.trim(), null);
    setOpen(false);
  }

  return (
    <div className="relative">
      <Input
        id="city"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        autoComplete="off"
        placeholder="Ej. Pereira, Dosquebradas, Armenia…"
        value={value}
        onChange={(e) => {
          onChange(e.target.value, null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Delay para que el mousedown de una opción alcance a disparar
          // antes de que el blur cierre la lista.
          blurTimeout.current = setTimeout(() => setOpen(false), 150);
        }}
        required
      />
      {open && (results.length > 0 || showFreeTextOption) && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-[1000] mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border bg-card py-1 shadow-lg"
        >
          {results.map((m) => (
            <li key={`${m.name}-${m.department}`}>
              <button
                type="button"
                role="option"
                aria-selected={normalizeMatch(value, m.name)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (blurTimeout.current) clearTimeout(blurTimeout.current);
                  selectMunicipio(m);
                }}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">
                  {m.name} <span className="text-muted-foreground">· {m.department}</span>
                </span>
                {normalizeMatch(value, m.name) && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
              </button>
            </li>
          ))}
          {showFreeTextOption && (
            <li>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted",
                  results.length > 0 && "border-t border-border"
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (blurTimeout.current) clearTimeout(blurTimeout.current);
                  selectFreeText();
                }}
              >
                No aparece en la lista — usar &ldquo;{value.trim()}&rdquo;
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function normalizeMatch(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
