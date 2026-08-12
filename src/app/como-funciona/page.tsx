import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";

const FAQS: { q: string; a: string }[] = [
  {
    q: "¿Qué es Rastrea Huellas?",
    a: "Una herramienta ciudadana, gratuita y sin ánimo de lucro, para que la comunidad reporte y busque mascotas perdidas o encontradas tras el sismo del 10 de agosto de 2026. No reemplaza a las autoridades, a la Cruz Roja ni a los organismos oficiales de emergencia.",
  },
  {
    q: "¿Cómo reporto una mascota perdida o encontrada?",
    a: 'Toca "Reportar" en el menú inferior, elige si la perdiste, la encontraste, o está en un refugio, y llena el formulario. Entre más detalle (foto, ubicación exacta, características), más fácil es que la comunidad ayude.',
  },
  {
    q: "¿Quién ve la información que publico?",
    a: "Todo lo que pongas en un reporte es público: cualquiera que visite el sitio puede verlo, incluyendo tu contacto. No compartas datos que no quieras hacer públicos aparte del número para que te escriban.",
  },
  {
    q: "¿Cómo contacto a quien reportó una mascota?",
    a: 'En el detalle de cada mascota hay un botón ("Contactar" o "Soy el dueño") que abre WhatsApp directo al número que dejó esa persona.',
  },
  {
    q: '¿Qué significa "Marcar como resuelto" y quién puede hacerlo?',
    a: "Cierra el reporte y lo quita de las listas y el mapa porque la mascota ya volvió a casa. Solo puede hacerlo el navegador de quien publicó el reporte originalmente — nadie más puede cerrar el reporte de otra persona. Si el creador ya no puede acceder a él, usa \"Reportar contenido inapropiado\" en ese reporte para avisarnos.",
  },
  {
    q: "¿Cómo agrego una fundación o refugio a la lista?",
    a: 'En la pestaña "Refugios" hay un botón para sugerir uno nuevo. Lo revisamos antes de publicarlo.',
  },
  {
    q: "¿Qué hago si veo un reporte falso, spam, o algo inapropiado?",
    a: 'Entra al reporte y toca "Reportar contenido inapropiado". Lo revisamos manualmente.',
  },
  {
    q: "¿Esto es un servicio oficial del gobierno o la Cruz Roja?",
    a: "No. Es un proyecto ciudadano independiente. Para reportes oficiales de personas desaparecidas usa los canales de la Cruz Roja Colombiana o la Línea 123.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <main className="flex flex-1 flex-col px-4 pt-5">
      <header className="mb-1 flex items-center gap-3">
        <Link href="/ayuda" className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h1 className="font-heading text-xl font-bold">Cómo funciona</h1>
        </div>
      </header>
      <p className="mb-5 text-sm text-muted-foreground">Preguntas frecuentes sobre Rastrea Huellas.</p>

      <ul className="flex flex-col gap-3 pb-6">
        {FAQS.map((item) => (
          <li key={item.q} className="rounded-2xl border border-border bg-card p-4">
            <p className="font-heading font-bold">{item.q}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
