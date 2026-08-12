import Link from "next/link";
import { PawPrint } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/time";
import type { PetReport } from "@/lib/types";

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

export default function PetCard({ report }: { report: PetReport }) {
  const displayName = report.name?.trim() || SPECIES_LABEL[report.species];
  const tag = report.breed || (report.sex ? (report.sex === "macho" ? "Macho" : "Hembra") : null);

  return (
    <Link
      href={`/mascota/${report.id}`}
      className="block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-transform active:scale-[0.98]"
    >
      <div className="relative aspect-square w-full bg-muted">
        {report.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={report.photo_url}
            alt={displayName}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <PawPrint className="h-8 w-8" />
          </div>
        )}
        <Badge
          className="absolute left-1.5 top-1.5 px-1.5 py-0 text-[0.65rem]"
          variant={report.status === "perdido" ? "destructive" : "default"}
        >
          {STATUS_LABEL[report.status]}
        </Badge>
      </div>
      <div className="p-2.5">
        <p className="font-heading text-sm font-bold leading-tight truncate">{displayName}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {report.city} · {timeAgo(report.created_at)}
        </p>
        {tag && (
          <Badge variant="secondary" className="mt-1.5 max-w-full truncate px-1.5 py-0 text-[0.65rem]">
            {tag}
          </Badge>
        )}
      </div>
    </Link>
  );
}
