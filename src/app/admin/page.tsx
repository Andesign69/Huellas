import { redirect } from "next/navigation";
import { Flag, HeartHandshake, PawPrint } from "lucide-react";
import { hasAdminSession } from "@/lib/adminAuth";
import { query } from "@/lib/db";
import AdminActionButton from "@/components/AdminActionButton";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import { timeAgo } from "@/lib/time";
import type { AdminFlag, AdminShelterSuggestion } from "@/lib/adminTypes";

// Sin esto, el build puede prerenderizar esta página como estática: en el
// Dockerfile, ADMIN_PASSWORD no existe todavía en tiempo de build (solo se
// inyecta al arrancar el contenedor, igual que DATABASE_URL — ver
// docs/deploy.md), así que hasAdminSession() corta antes de tocar cookies()
// y Next nunca detecta que la ruta depende de la sesión. El resultado
// quedaría cacheado para siempre como "sin sesión → redirect a /login",
// ignorando la cookie real en cada request.
export const dynamic = "force-dynamic";

const SPECIES_LABEL: Record<string, string> = { perro: "Perro", gato: "Gato", otro: "Mascota" };
const STATUS_LABEL: Record<string, string> = { perdido: "Perdido", encontrado: "Encontrado", en_refugio: "En refugio" };

export default async function AdminPage() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  const [[flags, flagsError], [suggestions, suggestionsError]] = await Promise.all([
    query<AdminFlag>("select * from admin_list_flags()")
      .then((r): [AdminFlag[], boolean] => [r.rows, false])
      .catch((err): [AdminFlag[], boolean] => {
        console.error(err);
        return [[], true];
      }),
    query<AdminShelterSuggestion>("select * from admin_list_shelter_suggestions()")
      .then((r): [AdminShelterSuggestion[], boolean] => [r.rows, false])
      .catch((err): [AdminShelterSuggestion[], boolean] => {
        console.error(err);
        return [[], true];
      }),
  ]);

  return (
    <main className="flex flex-1 flex-col px-4 pt-5 pb-8">
      <header className="mb-5 flex items-center justify-between gap-2">
        <h1 className="font-heading text-xl font-bold">Admin</h1>
        <AdminLogoutButton />
      </header>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Flag className="h-4.5 w-4.5 text-primary" />
          <h2 className="font-heading text-base font-bold">Contenido reportado ({flags.length})</h2>
        </div>
        {flagsError ? (
          <p className="text-sm text-destructive">No se pudieron cargar las banderas. Intenta de nuevo.</p>
        ) : flags.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay banderas pendientes.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {flags.map((f) => (
              <li key={f.flag_id} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                      {f.report_photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f.report_photo_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <PawPrint className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {f.report_name?.trim() || SPECIES_LABEL[f.report_species]} ·{" "}
                        {STATUS_LABEL[f.report_status]} · {f.report_city}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Reportado {timeAgo(f.flagged_at)} · contacto {f.report_contact}
                      </p>
                      {f.reason && <p className="mt-1 text-xs">&ldquo;{f.reason}&rdquo;</p>}
                      <a
                        href={`/mascota/${f.report_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs font-medium text-primary underline underline-offset-2"
                      >
                        Ver reporte
                      </a>
                    </div>
                  </div>
                  <AdminActionButton
                    url={`/api/admin/flags/${f.flag_id}/dismiss`}
                    label="Descartar"
                    variant="outline"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-center gap-2">
          <HeartHandshake className="h-4.5 w-4.5 text-primary" />
          <h2 className="font-heading text-base font-bold">Refugios sugeridos ({suggestions.length})</h2>
        </div>
        {suggestionsError ? (
          <p className="text-sm text-destructive">No se pudieron cargar las sugerencias. Intenta de nuevo.</p>
        ) : suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay sugerencias pendientes.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {suggestions.map((s) => (
              <li key={s.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {s.name} · {s.city}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sugerido {timeAgo(s.created_at)} · contacto {s.contact}
                    </p>
                    {s.website && (
                      <a
                        href={s.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-primary underline underline-offset-2"
                      >
                        {s.website}
                      </a>
                    )}
                    {s.notes && <p className="mt-1 text-xs text-muted-foreground">{s.notes}</p>}
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5">
                    <AdminActionButton
                      url={`/api/admin/shelter-suggestions/${s.id}/approve`}
                      label="Aprobar"
                      variant="default"
                    />
                    <AdminActionButton
                      url={`/api/admin/shelter-suggestions/${s.id}/reject`}
                      label="Rechazar"
                      variant="destructive"
                      confirmMessage="¿Descartar esta sugerencia de refugio?"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
