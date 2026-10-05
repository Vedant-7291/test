export function formatDate(iso: string) {
  return iso.slice(0, 10);
}

export function formatDateTime(isoOrMs: string | number) {
  const iso = typeof isoOrMs === "number" ? new Date(isoOrMs).toISOString() : isoOrMs;
  return iso.replace("T", " ").slice(0, 16);
}
