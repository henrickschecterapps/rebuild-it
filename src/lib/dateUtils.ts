/**
 * Parse a date string in either "dd/mm/yyyy" or "yyyy-mm-dd" format.
 * Returns null when the input is empty or invalid.
 */
export function parseEventStringDate(value?: string | null): Date | null {
  if (!value) return null;
  const str = String(value).trim();
  if (!str) return null;

  // yyyy-mm-dd
  let m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return isNaN(d.getTime()) ? null : d;
  }

  // dd/mm/yyyy
  m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    return isNaN(d.getTime()) ? null : d;
  }

  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback;
}

export function formatDateBR(value?: string | null): string {
  const d = parseEventStringDate(value);
  if (!d) return "";
  return d.toLocaleDateString("pt-BR");
}