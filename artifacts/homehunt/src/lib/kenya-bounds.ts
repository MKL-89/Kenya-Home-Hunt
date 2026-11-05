/**
 * Rough box around Kenya, used to catch map pins dropped outside the country.
 * Keep in step with KENYA_BOUNDS in artifacts/api-server/src/routes/houses.ts.
 */
export const KENYA_BOUNDS = { minLat: -4.9, maxLat: 5.1, minLng: 33.8, maxLng: 42.0 };

export function isInKenya(lat: number, lng: number): boolean {
  return lat >= KENYA_BOUNDS.minLat && lat <= KENYA_BOUNDS.maxLat &&
    lng >= KENYA_BOUNDS.minLng && lng <= KENYA_BOUNDS.maxLng;
}

/** Bring a longitude from a repeated world copy (e.g. 396.8) back to -180..180. */
export function normalizeLng(lng: number): number {
  return ((((lng + 180) % 360) + 360) % 360) - 180;
}
