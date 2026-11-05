import { Router } from "express";
import { db, favoritesTable, housesTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { houseColumns } from "../lib/houseColumns";
import { requireAuth } from "./users";

const router = Router();

// GET /api/favorites
router.get("/favorites", requireAuth, async (req: any, res: any) => {
  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!user[0]) return res.status(401).json({ error: "Unauthorized" });

    const favs = await db
      .select(houseColumns)
      .from(favoritesTable)
      .innerJoin(housesTable, eq(favoritesTable.houseId, housesTable.id))
      .leftJoin(usersTable, eq(housesTable.landlordId, usersTable.id))
      .where(eq(favoritesTable.tenantId, user[0].id))
      .orderBy(desc(favoritesTable.createdAt));

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
    if (!Number.isInteger(houseId) || houseId <= 0) return res.status(400).json({ error: "Invalid house ID" });
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!user[0]) return res.status(401).json({ error: "Unauthorized" });

    const house = await db.select({ id: housesTable.id }).from(housesTable).where(eq(housesTable.id, houseId)).limit(1);
    if (!house[0]) return res.status(404).json({ error: "House not found" });

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
