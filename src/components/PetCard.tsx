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

  return (
    <Link
      href={`/mascota/${report.id}`}
      className="block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-transform active:scale-[0.99]"
    >
      <div className="relative h-44 w-full bg-muted">
        {report.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={report.photo_url} alt={displayName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <PawPrint className="h-10 w-10" />
          </div>
        )}
        <Badge
          className="absolute left-3 top-3"
          variant={report.status === "perdido" ? "destructive" : "default"}
        >
          {STATUS_LABEL[report.status]}
        </Badge>
      </div>
      <div className="p-3">
        <p className="font-heading text-lg font-bold leading-tight">{displayName}</p>
        <p className="text-xs text-muted-foreground">{timeAgo(report.created_at)}</p>
        <p className="mt-1 text-sm text-muted-foreground">{report.city}</p>
        {(report.breed || report.sex) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {report.breed && <Badge variant="secondary">{report.breed}</Badge>}
            {report.sex && <Badge variant="secondary">{report.sex === "macho" ? "Macho" : "Hembra"}</Badge>}
          </div>
        )}
      </div>
    </Link>
  );
}
