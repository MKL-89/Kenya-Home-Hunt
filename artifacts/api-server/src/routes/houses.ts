import { Router } from "express";
import { db, housesTable, usersTable, favoritesTable } from "@workspace/db";
import { eq, and, gte, lte, ilike } from "drizzle-orm";
import { requireAuth } from "./users";

const router = Router();

// Kenya bounding box — rough check to keep listings in Kenya
const KENYA_BOUNDS = { minLat: -4.9, maxLat: 5.0, minLng: 33.9, maxLng: 41.9 };

function isInKenya(lat: number, lng: number): boolean {
  return lat >= KENYA_BOUNDS.minLat && lat <= KENYA_BOUNDS.maxLat &&
    lng >= KENYA_BOUNDS.minLng && lng <= KENYA_BOUNDS.maxLng;
}

// GET /api/houses
router.get("/houses", async (req: any, res: any) => {
  try {
    const { status, city, county, town, estate, minRent, maxRent, bedrooms } = req.query;

    const query = db.select({
      id: housesTable.id,
      landlordId: housesTable.landlordId,
      landlordName: usersTable.name,
      landlordPhone: usersTable.phone,
      title: housesTable.title,
      description: housesTable.description,
      rentPrice: housesTable.rentPrice,
      bedrooms: housesTable.bedrooms,
      bathrooms: housesTable.bathrooms,
      county: housesTable.county,
      town: housesTable.town,
      estate: housesTable.estate,
      city: housesTable.city,
      address: housesTable.address,
      latitude: housesTable.latitude,
      longitude: housesTable.longitude,
      status: housesTable.status,
      images: housesTable.images,
      amenities: housesTable.amenities,
      createdAt: housesTable.createdAt,
      updatedAt: housesTable.updatedAt,
    }).from(housesTable)
      .leftJoin(usersTable, eq(housesTable.landlordId, usersTable.id));

    const conditions: any[] = [];
    if (status) conditions.push(eq(housesTable.status, status as string));
    if (county) conditions.push(ilike(housesTable.county, county as string));
    if (town) conditions.push(ilike(housesTable.town, town as string));
    if (estate) conditions.push(ilike(housesTable.estate, estate as string));
    if (city) conditions.push(ilike(housesTable.city, city as string));
    if (minRent) conditions.push(gte(housesTable.rentPrice, Number(minRent)));
    if (maxRent) conditions.push(lte(housesTable.rentPrice, Number(maxRent)));
    if (bedrooms) conditions.push(eq(housesTable.bedrooms, Number(bedrooms)));

    const houses = conditions.length > 0
      ? await query.where(and(...conditions))
      : await query;

    const auth = req.auth?.();
    if (auth?.userId) {
      const dbUser = await db.select().from(usersTable).where(eq(usersTable.clerkId, auth.userId)).limit(1);
      if (dbUser[0]) {
        const favs = await db.select({ houseId: favoritesTable.houseId }).from(favoritesTable).where(eq(favoritesTable.tenantId, dbUser[0].id));
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
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!user[0]) return res.status(401).json({ error: "Unauthorized" });
    if (user[0].role !== "landlord") {
      return res.status(403).json({ error: "Only landlords can create listings" });
    }

    const { title, description, rentPrice, bedrooms, bathrooms, county, town, estate, city, address, latitude, longitude, images, amenities } = req.body;

    if (!title || title.trim().length < 3) {
      return res.status(400).json({ error: "Title must be at least 3 characters" });
    }
    if (!rentPrice || Number(rentPrice) <= 0) {
      return res.status(400).json({ error: "Rent price must be a positive number" });
    }
    if (!address || address.trim().length < 3) {
      return res.status(400).json({ error: "Address is required" });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Valid latitude and longitude are required" });
    }
    if (!isInKenya(lat, lng)) {
      return res.status(400).json({ error: "Property location must be within Kenya" });
    }

    const resolvedCounty = county || city || "";
    const resolvedCity = city || county || "";

    const house = await db.insert(housesTable).values({
      landlordId: user[0].id,
      title: title.trim(),
      description: description?.trim() || null,
      rentPrice: Number(rentPrice),
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      county: resolvedCounty,
      town: town || "",
      estate: estate || "",
      city: resolvedCity,
      address: address.trim(),
      latitude: lat,
      longitude: lng,
      images: Array.isArray(images) ? images : [],
      amenities: Array.isArray(amenities) ? amenities : [],
      status: "vacant",
    }).returning();

    return res.status(201).json({
      ...house[0],
      landlordName: user[0].name,
      landlordPhone: user[0].phone,
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
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!user[0]) return res.status(401).json({ error: "User not found" });

    const houses = await db.select().from(housesTable).where(eq(housesTable.landlordId, user[0].id));
    return res.json(houses.map(h => ({ ...h, landlordName: user[0].name, landlordPhone: user[0].phone, isFavorited: null })));
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

    const houses = await db.select({
      id: housesTable.id,
      landlordId: housesTable.landlordId,
      landlordName: usersTable.name,
      landlordPhone: usersTable.phone,
      title: housesTable.title,
      description: housesTable.description,
      rentPrice: housesTable.rentPrice,
      bedrooms: housesTable.bedrooms,
      bathrooms: housesTable.bathrooms,
      county: housesTable.county,
      town: housesTable.town,
      estate: housesTable.estate,
      city: housesTable.city,
      address: housesTable.address,
      latitude: housesTable.latitude,
      longitude: housesTable.longitude,
      status: housesTable.status,
      images: housesTable.images,
      amenities: housesTable.amenities,
      createdAt: housesTable.createdAt,
      updatedAt: housesTable.updatedAt,
    }).from(housesTable)
      .leftJoin(usersTable, eq(housesTable.landlordId, usersTable.id))
      .where(eq(housesTable.id, id))
      .limit(1);

    if (!houses[0]) return res.status(404).json({ error: "House not found" });

    // Check if favorited
    const auth = req.auth?.();
    let isFavorited: boolean | null = null;
    if (auth?.userId) {
      const dbUser = await db.select().from(usersTable).where(eq(usersTable.clerkId, auth.userId)).limit(1);
      if (dbUser[0]) {
        const fav = await db.select().from(favoritesTable).where(
          and(eq(favoritesTable.tenantId, dbUser[0].id), eq(favoritesTable.houseId, id))
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

    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!user[0]) return res.status(401).json({ error: "Unauthorized" });

    const house = await db.select().from(housesTable).where(
      and(eq(housesTable.id, id), eq(housesTable.landlordId, user[0].id))
    ).limit(1);
    if (!house[0]) return res.status(404).json({ error: "House not found or unauthorized" });

    const { title, description, rentPrice, bedrooms, bathrooms, county, town, estate, city, address, latitude, longitude, images, amenities } = req.body;

    const lat = latitude !== undefined ? Number(latitude) : undefined;
    const lng = longitude !== undefined ? Number(longitude) : undefined;
    if (lat !== undefined && lng !== undefined && !isInKenya(lat, lng)) {
      return res.status(400).json({ error: "Property location must be within Kenya" });
    }

    const updated = await db.update(housesTable).set({
      title,
      description,
      rentPrice: rentPrice !== undefined ? Number(rentPrice) : undefined,
      bedrooms: bedrooms !== undefined ? Number(bedrooms) : undefined,
      bathrooms: bathrooms !== undefined ? Number(bathrooms) : undefined,
      county: county || undefined,
      town: town !== undefined ? town : undefined,
      estate: estate !== undefined ? estate : undefined,
      city: city || county || undefined,
      address,
      latitude: lat,
      longitude: lng,
      images,
      amenities,
      updatedAt: new Date(),
    }).where(eq(housesTable.id, id)).returning();

    return res.json({ ...updated[0], landlordName: user[0].name, landlordPhone: user[0].phone, isFavorited: null });
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

    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!user[0]) return res.status(401).json({ error: "Unauthorized" });

    const house = await db.select().from(housesTable).where(
      and(eq(housesTable.id, id), eq(housesTable.landlordId, user[0].id))
    ).limit(1);
    if (!house[0]) return res.status(404).json({ error: "House not found or unauthorized" });

    await db.delete(housesTable).where(eq(housesTable.id, id));
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

    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!user[0]) return res.status(401).json({ error: "Unauthorized" });

    const { status } = req.body;
    if (!["vacant", "occupied"].includes(status)) {
      return res.status(400).json({ error: "Status must be vacant or occupied" });
    }

    const house = await db.select().from(housesTable).where(
      and(eq(housesTable.id, id), eq(housesTable.landlordId, user[0].id))
    ).limit(1);
    if (!house[0]) return res.status(404).json({ error: "House not found or unauthorized" });

    const updated = await db.update(housesTable).set({ status, updatedAt: new Date() }).where(eq(housesTable.id, id)).returning();
    return res.json({ ...updated[0], landlordName: user[0].name, landlordPhone: user[0].phone, isFavorited: null });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
