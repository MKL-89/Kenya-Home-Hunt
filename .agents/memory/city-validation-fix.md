---
name: City validation bug fix
description: Root cause and fix for landlords being unable to create listings
---

The original `artifacts/api-server/src/routes/houses.ts` had a hardcoded array `KENYA_CITIES = ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret"]` and rejected any listing whose `city` field didn't match. This meant any landlord outside those 5 cities (or who left the field empty) got a 400 error.

**Fix:** Removed the allowlist entirely. Replaced with a lat/lng bounding-box check (`KENYA_BOUNDS`) to keep listings within Kenya. Added `county`, `town`, `estate` columns to the DB schema and the API. The `city` column is kept for backward compat and auto-populated from `county`.

**Why:** The bounding-box approach is more robust and allows all 47 counties without maintaining a list.

**How to apply:** Any future validation of "is this in Kenya?" should use the bounding box, not a city name list.
