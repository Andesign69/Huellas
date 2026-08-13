import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReportStatus } from "@/lib/types";

const STATUS_LABEL: Record<ReportStatus, string> = {
  perdido: "Perdido",
  encontrado: "Encontrado",
  en_refugio: "En refugio",
};

export default function StatusBadge({ status, className }: { status: ReportStatus; className?: string }) {
  return (
    <Badge
      className={cn(
        // Los chips van sobre fotos, no sobre el fondo de una card: el variant
        // "destructive" de shadcn usa bg-destructive/10 (pensado para alertas
        // sobre fondo blanco) y se vuelve casi invisible sobre una imagen.
        status === "perdido" ? "bg-destructive text-white" : "bg-primary text-primary-foreground",
        className
      )}
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
}
