import { Router } from "express";
import { db, housesTable, usersTable, favoritesTable, inquiriesTable } from "@workspace/db";
import { eq, and, count, avg, sql } from "drizzle-orm";
import { requireAuth } from "./users";

const router = Router();

// GET /api/stats/tenant
router.get("/stats/tenant", requireAuth, async (req: any, res: any) => {
  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!user[0]) return res.status(401).json({ error: "Unauthorized" });

    const [favsCount] = await db.select({ count: count() }).from(favoritesTable).where(eq(favoritesTable.tenantId, user[0].id));
    const [vacantCount] = await db.select({ count: count() }).from(housesTable).where(eq(housesTable.status, "vacant"));
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [recentCount] = await db.select({ count: count() }).from(housesTable).where(
      and(eq(housesTable.status, "vacant"), sql`${housesTable.createdAt} >= ${sevenDaysAgo}`)
    );

    const cityBreakdown = await db
      .select({
        city: housesTable.city,
        total: count(),
        vacant: sql<number>`sum(case when ${housesTable.status} = 'vacant' then 1 else 0 end)`,
        avgRent: avg(housesTable.rentPrice),
      })
      .from(housesTable)
      .groupBy(housesTable.city);

    return res.json({
      favoritesCount: favsCount.count,
      totalVacantHouses: vacantCount.count,
      recentlyAdded: recentCount.count,
      cityBreakdown: cityBreakdown.map(c => ({
        city: c.city,
        total: Number(c.total),
        vacant: Number(c.vacant),
        avgRent: Number(c.avgRent) || 0,
      })),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/stats/landlord
router.get("/stats/landlord", requireAuth, async (req: any, res: any) => {
  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!user[0]) return res.status(401).json({ error: "Unauthorized" });

    const [total] = await db.select({ count: count() }).from(housesTable).where(eq(housesTable.landlordId, user[0].id));
    const [vacant] = await db.select({ count: count() }).from(housesTable).where(
      and(eq(housesTable.landlordId, user[0].id), eq(housesTable.status, "vacant"))
    );
    const [occupied] = await db.select({ count: count() }).from(housesTable).where(
      and(eq(housesTable.landlordId, user[0].id), eq(housesTable.status, "occupied"))
    );
    const [avgRentRow] = await db.select({ avg: avg(housesTable.rentPrice) }).from(housesTable).where(eq(housesTable.landlordId, user[0].id));
    const [totalRevRow] = await db.select({ total: sql<number>`sum(${housesTable.rentPrice})` }).from(housesTable).where(
      and(eq(housesTable.landlordId, user[0].id), eq(housesTable.status, "occupied"))
    );

    const [unreadRow] = await db.select({ count: count() }).from(inquiriesTable).where(
      and(eq(inquiriesTable.landlordId, user[0].id), eq(inquiriesTable.status, "unread"))
    );

    return res.json({
      totalListings: total.count,
      vacantCount: vacant.count,
      occupiedCount: occupied.count,
      avgRent: Number(avgRentRow.avg) || 0,
      totalMonthlyRevenue: Number(totalRevRow.total) || 0,
      unreadInquiries: unreadRow.count,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/stats/city-breakdown
router.get("/stats/city-breakdown", async (req: any, res: any) => {
  try {
    const cityBreakdown = await db
      .select({
        city: housesTable.city,
        total: count(),
        vacant: sql<number>`sum(case when ${housesTable.status} = 'vacant' then 1 else 0 end)`,
        avgRent: avg(housesTable.rentPrice),
      })
      .from(housesTable)
      .groupBy(housesTable.city);

    return res.json(cityBreakdown.map(c => ({
      city: c.city,
      total: Number(c.total),
      vacant: Number(c.vacant),
      avgRent: Number(c.avgRent) || 0,
    })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
