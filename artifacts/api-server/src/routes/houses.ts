import { Router } from "express";
import { db, housesTable, usersTable, favoritesTable } from "@workspace/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { requireAuth } from "./users";

const router = Router();

const KENYA_CITIES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"];

// GET /api/houses
router.get("/houses", async (req: any, res: any) => {
  try {
    const { status, city, minRent, maxRent, bedrooms } = req.query;

    let query = db.select({
      id: housesTable.id,
      landlordId: housesTable.landlordId,
      landlordName: usersTable.name,
      landlordPhone: usersTable.phone,
      title: housesTable.title,
      description: housesTable.description,
      rentPrice: housesTable.rentPrice,
      bedrooms: housesTable.bedrooms,
      bathrooms: housesTable.bathrooms,
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
    if (city) conditions.push(eq(housesTable.city, city as string));
    if (minRent) conditions.push(gte(housesTable.rentPrice, Number(minRent)));
    if (maxRent) conditions.push(lte(housesTable.rentPrice, Number(maxRent)));
    if (bedrooms) conditions.push(eq(housesTable.bedrooms, Number(bedrooms)));

    const houses = conditions.length > 0
      ? await query.where(and(...conditions))
      : await query;

    // Get auth if available for isFavorited
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
    if (!user[0] || user[0].role !== "landlord") {
      return res.status(403).json({ error: "Only landlords can create listings" });
    }

    const { title, description, rentPrice, bedrooms, bathrooms, city, address, latitude, longitude, images, amenities } = req.body;

    if (!KENYA_CITIES.some(c => c.toLowerCase() === city?.toLowerCase())) {
      return res.status(400).json({ error: "City must be one of: " + KENYA_CITIES.join(", ") });
    }

    const house = await db.insert(housesTable).values({
      landlordId: user[0].id,
      title,
      description,
      rentPrice: Number(rentPrice),
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      city,
      address,
      latitude: Number(latitude),
      longitude: Number(longitude),
      images: images || [],
      amenities: amenities || [],
      status: "vacant",
    }).returning();

    return res.status(201).json({ ...house[0], landlordName: user[0].name, landlordPhone: user[0].phone, isFavorited: null });
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
    return res.json({ ...houses[0], isFavorited: null });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/houses/:id
router.put("/houses/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = Number(req.params.id);
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!user[0]) return res.status(401).json({ error: "Unauthorized" });

    const house = await db.select().from(housesTable).where(and(eq(housesTable.id, id), eq(housesTable.landlordId, user[0].id))).limit(1);
    if (!house[0]) return res.status(404).json({ error: "House not found or unauthorized" });

    const { title, description, rentPrice, bedrooms, bathrooms, city, address, latitude, longitude, images, amenities } = req.body;
    const updated = await db.update(housesTable).set({
      title, description,
      rentPrice: rentPrice !== undefined ? Number(rentPrice) : undefined,
      bedrooms: bedrooms !== undefined ? Number(bedrooms) : undefined,
      bathrooms: bathrooms !== undefined ? Number(bathrooms) : undefined,
      city, address,
      latitude: latitude !== undefined ? Number(latitude) : undefined,
      longitude: longitude !== undefined ? Number(longitude) : undefined,
      images, amenities,
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
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!user[0]) return res.status(401).json({ error: "Unauthorized" });

    const house = await db.select().from(housesTable).where(and(eq(housesTable.id, id), eq(housesTable.landlordId, user[0].id))).limit(1);
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
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!user[0]) return res.status(401).json({ error: "Unauthorized" });

    const { status } = req.body;
    if (!["vacant", "occupied"].includes(status)) {
      return res.status(400).json({ error: "Status must be vacant or occupied" });
    }

    const house = await db.select().from(housesTable).where(and(eq(housesTable.id, id), eq(housesTable.landlordId, user[0].id))).limit(1);
    if (!house[0]) return res.status(404).json({ error: "House not found or unauthorized" });

    const updated = await db.update(housesTable).set({ status, updatedAt: new Date() }).where(eq(housesTable.id, id)).returning();
    return res.json({ ...updated[0], landlordName: user[0].name, landlordPhone: user[0].phone, isFavorited: null });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
