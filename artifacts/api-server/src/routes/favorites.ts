import { Router } from "express";
import { db, favoritesTable, housesTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "./users";

const router = Router();

// GET /api/favorites
router.get("/favorites", requireAuth, async (req: any, res: any) => {
  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!user[0]) return res.status(401).json({ error: "Unauthorized" });

    const favs = await db
      .select({
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
      })
      .from(favoritesTable)
      .innerJoin(housesTable, eq(favoritesTable.houseId, housesTable.id))
      .leftJoin(usersTable, eq(housesTable.landlordId, usersTable.id))
      .where(eq(favoritesTable.tenantId, user[0].id));

    return res.json(favs.map(h => ({ ...h, isFavorited: true })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/favorites/:houseId
router.post("/favorites/:houseId", requireAuth, async (req: any, res: any) => {
  try {
    const houseId = Number(req.params.houseId);
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!user[0]) return res.status(401).json({ error: "Unauthorized" });

    const existing = await db.select().from(favoritesTable).where(
      and(eq(favoritesTable.tenantId, user[0].id), eq(favoritesTable.houseId, houseId))
    ).limit(1);

    if (existing[0]) return res.status(201).json(existing[0]);

    const fav = await db.insert(favoritesTable).values({ tenantId: user[0].id, houseId }).returning();
    return res.status(201).json(fav[0]);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/favorites/:houseId
router.delete("/favorites/:houseId", requireAuth, async (req: any, res: any) => {
  try {
    const houseId = Number(req.params.houseId);
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!user[0]) return res.status(401).json({ error: "Unauthorized" });

    await db.delete(favoritesTable).where(
      and(eq(favoritesTable.tenantId, user[0].id), eq(favoritesTable.houseId, houseId))
    );
    return res.status(204).send();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
