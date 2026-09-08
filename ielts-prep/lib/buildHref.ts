export function buildHref(path: string, params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}
