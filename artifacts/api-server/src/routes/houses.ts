import { Router } from "express";
import { db, housesTable, usersTable, favoritesTable, inquiriesTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, desc } from "drizzle-orm";
import { requireAuth } from "./users";
import { houseColumns } from "../lib/houseColumns";

const router = Router();

// Kenya bounding box — rough check to keep listings in Kenya
// Keep in step with artifacts/homehunt/src/lib/kenya-bounds.ts
const KENYA_BOUNDS = { minLat: -4.9, maxLat: 5.1, minLng: 33.8, maxLng: 42.0 };
const HOUSE_STATUSES = ["vacant", "occupied"];

function isInKenya(lat: number, lng: number): boolean {
  return lat >= KENYA_BOUNDS.minLat && lat <= KENYA_BOUNDS.maxLat &&
    lng >= KENYA_BOUNDS.minLng && lng <= KENYA_BOUNDS.maxLng;
}

function isBlank(v: unknown): boolean {
  return typeof v !== "string" || v.trim().length === 0;
}

async function getDbUser(clerkId: string) {
  const rows = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
  return rows[0];
}

// GET /api/houses
router.get("/houses", async (req: any, res: any) => {
  try {
    const { status, city, county, town, estate, minRent, maxRent, bedrooms } = req.query;

    if (status && !HOUSE_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Status must be vacant or occupied" });
    }

    const conditions: any[] = [];
    if (status) conditions.push(eq(housesTable.status, status as string));
    if (county) conditions.push(ilike(housesTable.county, county as string));
    if (town) conditions.push(ilike(housesTable.town, town as string));
    if (estate) conditions.push(ilike(housesTable.estate, estate as string));
    if (city) conditions.push(ilike(housesTable.city, city as string));
    if (minRent && !isNaN(Number(minRent))) conditions.push(gte(housesTable.rentPrice, Number(minRent)));
    if (maxRent && !isNaN(Number(maxRent))) conditions.push(lte(housesTable.rentPrice, Number(maxRent)));
    if (bedrooms && !isNaN(Number(bedrooms))) {
      const n = Number(bedrooms);
      // The UI's highest option is "4+", so 4 means "4 or more"
      conditions.push(n >= 4 ? gte(housesTable.bedrooms, n) : eq(housesTable.bedrooms, n));
    }

    const houses = await db.select(houseColumns)
      .from(housesTable)
      .leftJoin(usersTable, eq(housesTable.landlordId, usersTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(housesTable.createdAt));

    const auth = req.auth?.();
    if (auth?.userId) {
      const dbUser = await getDbUser(auth.userId);
      if (dbUser) {
        const favs = await db.select({ houseId: favoritesTable.houseId }).from(favoritesTable).where(eq(favoritesTable.tenantId, dbUser.id));
        const favSet = new Set(favs.map(f => f.houseId));
        return res.json(houses.map(h => ({ ...h, isFavorited: favSet.has(h.id) })));
      }
    }

    return res.json(houses.map(h => ({ ...h, isFavorited: null })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/houses
router.post("/houses", requireAuth, async (req: any, res: any) => {
  try {
    const user = await getDbUser(req.clerkUserId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (user.role !== "landlord") {
      return res.status(403).json({ error: "Only landlords can create listings" });
    }

    const { title, description, rentPrice, bedrooms, bathrooms, propertyType, contactPhone, county, town, estate, city, address, latitude, longitude, images, amenities } = req.body;

    if (isBlank(title) || title.trim().length < 3) {
      return res.status(400).json({ error: "Title must be at least 3 characters" });
    }
    if (!rentPrice || isNaN(Number(rentPrice)) || Number(rentPrice) <= 0) {
      return res.status(400).json({ error: "Rent price must be a positive number" });
    }
    if (isBlank(address) || address.trim().length < 3) {
      return res.status(400).json({ error: "Address is required" });
    }
    if (isBlank(propertyType)) {
      return res.status(400).json({ error: "Property type is required" });
    }
    if (isBlank(contactPhone)) {
      return res.status(400).json({ error: "Contact phone is required" });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (latitude === undefined || longitude === undefined || isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Valid latitude and longitude are required" });
    }
    if (!isInKenya(lat, lng)) {
      return res.status(400).json({ error: "The map pin is outside Kenya. Click the map exactly where the property is." });
    }

    const resolvedCounty = county || city || "";
    const resolvedCity = city || county || "";

    const house = await db.insert(housesTable).values({
      landlordId: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      rentPrice: Number(rentPrice),
      bedrooms: Math.max(0, Number(bedrooms) || 0),
      bathrooms: Math.max(0, Number(bathrooms) || 0),
      propertyType: propertyType.trim(),
      contactPhone: contactPhone.trim(),
      county: resolvedCounty,
      town: town || "",
      estate: estate || "",
      city: resolvedCity,
      address: address.trim(),
      latitude: lat,
      longitude: lng,
      images: Array.isArray(images) ? images.filter((i: unknown) => typeof i === "string") : [],
      amenities: Array.isArray(amenities) ? amenities.filter((a: unknown) => typeof a === "string") : [],
      status: "vacant",
    }).returning();

    return res.status(201).json({
      ...house[0],
      landlordName: user.name,
      landlordPhone: user.phone,
      isFavorited: null,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/houses/my
router.get("/houses/my", requireAuth, async (req: any, res: any) => {
  try {
    const user = await getDbUser(req.clerkUserId);
    if (!user) return res.status(401).json({ error: "User not found" });

    const houses = await db.select().from(housesTable)
      .where(eq(housesTable.landlordId, user.id))
      .orderBy(desc(housesTable.createdAt));
    return res.json(houses.map(h => ({ ...h, landlordName: user.name, landlordPhone: user.phone, isFavorited: null })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/houses/:id
router.get("/houses/:id", async (req: any, res: any) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid house ID" });

    const houses = await db.select(houseColumns)
      .from(housesTable)
      .leftJoin(usersTable, eq(housesTable.landlordId, usersTable.id))
      .where(eq(housesTable.id, id))
      .limit(1);

    if (!houses[0]) return res.status(404).json({ error: "House not found" });

    // Check if favorited
    const auth = req.auth?.();
    let isFavorited: boolean | null = null;
    if (auth?.userId) {
      const dbUser = await getDbUser(auth.userId);
      if (dbUser) {
        const fav = await db.select().from(favoritesTable).where(
          and(eq(favoritesTable.tenantId, dbUser.id), eq(favoritesTable.houseId, id))
        ).limit(1);
        isFavorited = fav.length > 0;
      }
    }

    return res.json({ ...houses[0], isFavorited });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/houses/:id
router.put("/houses/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid house ID" });

    const user = await getDbUser(req.clerkUserId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const house = await db.select().from(housesTable).where(
      and(eq(housesTable.id, id), eq(housesTable.landlordId, user.id))
    ).limit(1);
    if (!house[0]) return res.status(404).json({ error: "House not found or unauthorized" });

    const { title, description, rentPrice, bedrooms, bathrooms, propertyType, contactPhone, county, town, estate, city, address, latitude, longitude, images, amenities } = req.body;

    if (title !== undefined && (isBlank(title) || title.trim().length < 3)) {
      return res.status(400).json({ error: "Title must be at least 3 characters" });
    }
    if (rentPrice !== undefined && (isNaN(Number(rentPrice)) || Number(rentPrice) <= 0)) {
      return res.status(400).json({ error: "Rent price must be a positive number" });
    }
    if (address !== undefined && (isBlank(address) || address.trim().length < 3)) {
      return res.status(400).json({ error: "Address is required" });
    }
    if (propertyType !== undefined && isBlank(propertyType)) {
      return res.status(400).json({ error: "Property type is required" });
    }
    if (contactPhone !== undefined && isBlank(contactPhone)) {
      return res.status(400).json({ error: "Contact phone is required" });
    }

    const lat = latitude !== undefined ? Number(latitude) : house[0].latitude;
    const lng = longitude !== undefined ? Number(longitude) : house[0].longitude;
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Valid latitude and longitude are required" });
    }
    if (!isInKenya(lat, lng)) {
      return res.status(400).json({ error: "The map pin is outside Kenya. Click the map exactly where the property is." });
    }

    const updated = await db.update(housesTable).set({
      title: title?.trim(),
      description: description !== undefined ? (description?.trim() || null) : undefined,
      rentPrice: rentPrice !== undefined ? Number(rentPrice) : undefined,
      bedrooms: bedrooms !== undefined ? Math.max(0, Number(bedrooms) || 0) : undefined,
      bathrooms: bathrooms !== undefined ? Math.max(0, Number(bathrooms) || 0) : undefined,
      propertyType: propertyType?.trim(),
      contactPhone: contactPhone?.trim(),
      county: county || undefined,
      town: town !== undefined ? town : undefined,
      estate: estate !== undefined ? estate : undefined,
      city: city || county || undefined,
      address: address?.trim(),
      latitude: lat,
      longitude: lng,
      images: Array.isArray(images) ? images.filter((i: unknown) => typeof i === "string") : undefined,
      amenities: Array.isArray(amenities) ? amenities.filter((a: unknown) => typeof a === "string") : undefined,
      updatedAt: new Date(),
    }).where(eq(housesTable.id, id)).returning();

    return res.json({ ...updated[0], landlordName: user.name, landlordPhone: user.phone, isFavorited: null });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/houses/:id
router.delete("/houses/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid house ID" });

    const user = await getDbUser(req.clerkUserId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const house = await db.select().from(housesTable).where(
      and(eq(housesTable.id, id), eq(housesTable.landlordId, user.id))
    ).limit(1);
    if (!house[0]) return res.status(404).json({ error: "House not found or unauthorized" });

    // Remove dependent rows first so this works even on databases created
    // before the ON DELETE CASCADE foreign keys were added.
    await db.transaction(async (tx) => {
      await tx.delete(inquiriesTable).where(eq(inquiriesTable.houseId, id));
      await tx.delete(favoritesTable).where(eq(favoritesTable.houseId, id));
      await tx.delete(housesTable).where(eq(housesTable.id, id));
    });
    return res.status(204).send();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/houses/:id/status
router.patch("/houses/:id/status", requireAuth, async (req: any, res: any) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid house ID" });

    const user = await getDbUser(req.clerkUserId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { status } = req.body;
    if (!HOUSE_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Status must be vacant or occupied" });
    }

    const house = await db.select().from(housesTable).where(
      and(eq(housesTable.id, id), eq(housesTable.landlordId, user.id))
    ).limit(1);
    if (!house[0]) return res.status(404).json({ error: "House not found or unauthorized" });

    const updated = await db.update(housesTable).set({ status, updatedAt: new Date() }).where(eq(housesTable.id, id)).returning();
    return res.json({ ...updated[0], landlordName: user.name, landlordPhone: user.phone, isFavorited: null });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
