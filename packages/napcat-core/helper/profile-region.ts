/** Self-reported profile region only; never infer a location from other fields. */
export interface ProfileRegion {
  country?: string;
  province?: string;
  city?: string;
}

function text (value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Keep one source together: mixing old/new components can invent a region. */
export function selectProfileRegion (fresh?: ProfileRegion, fallback?: ProfileRegion): Required<ProfileRegion> {
  for (const source of [fresh, fallback]) {
    const region = { country: text(source?.country), province: text(source?.province), city: text(source?.city) };
    if (Object.values(region).some(Boolean)) return region;
  }
  return { country: '', province: '', city: '' };
}

export function profileRegionArea (source?: ProfileRegion): string {
  const region = selectProfileRegion(source);
  return [...new Set(Object.values(region).filter(Boolean))].join(' ');
}
