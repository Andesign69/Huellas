const PREFIX = "huellas:resolve:";

export function saveResolveToken(reportId: string, token: string) {
  try {
    localStorage.setItem(PREFIX + reportId, token);
  } catch {
    // localStorage no disponible (modo privado, etc.) — el reporte igual
    // se publica, solo que no se podrá marcar como resuelto desde este
    // navegador.
  }
}

export function getResolveToken(reportId: string): string | null {
  try {
    return localStorage.getItem(PREFIX + reportId);
  } catch {
    return null;
  }
}
