/** Property types landlords can choose, and tenants can filter by. Cheapest first. */
export const PROPERTY_TYPES = [
  "Single Room",
  "Bedsitter",
  "Hostel / Student Room",
  "Shared House",
  "Studio",
  "Apartment",
  "Furnished / Short Stay",
  "Bungalow",
  "Maisonette",
  "Townhouse",
  "Villa",
  "Commercial Space",
] as const;

/** Monthly budget choices (KES), from student budgets upwards. */
export const BUDGETS = [5000, 8000, 10000, 15000, 20000, 30000, 50000, 80000, 120000, 200000];
