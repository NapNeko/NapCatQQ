/** Decode individual GET / form values before applying the public Qzone action contract. */
export function decodeQzonePublicHttpParameters (parameters: unknown): Record<string, unknown> {
  if (parameters === null || typeof parameters !== 'object' || Array.isArray(parameters)) return {};
  return Object.fromEntries(Object.entries(parameters).map(([key, value]) => {
    if (typeof value !== 'string') return [key, value];
    try {
      return [key, JSON.parse(value) as unknown];
    } catch {
      return [key, value];
    }
  }));
}
