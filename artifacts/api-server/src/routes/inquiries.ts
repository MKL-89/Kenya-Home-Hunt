import { Router } from "express";
import { db, usersTable, housesTable, inquiriesTable } from "@workspace/db";
import { eq, and, count, desc } from "drizzle-orm";
import { requireAuth } from "./users";
import { z } from "zod";

const router = Router();

const sendInquirySchema = z.object({
  houseId: z.number().int().positive(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  tenantPhone: z.string().optional(),
});

// POST /api/inquiries — tenant sends an inquiry
router.post("/inquiries", requireAuth, async (req: any, res: any) => {
  try {
    const parsed = sendInquirySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid request" });
    }

    const tenant = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!tenant[0]) return res.status(401).json({ error: "Unauthorized" });

    const house = await db.select().from(housesTable).where(eq(housesTable.id, parsed.data.houseId)).limit(1);
    if (!house[0]) return res.status(404).json({ error: "House not found" });
    if (house[0].landlordId === tenant[0].id) {
      return res.status(400).json({ error: "You cannot send an inquiry about your own listing" });
    }

    const inquiry = await db.insert(inquiriesTable).values({
      tenantId: tenant[0].id,
      landlordId: house[0].landlordId,
      houseId: parsed.data.houseId,
      message: parsed.data.message,
      tenantName: tenant[0].name,
      tenantPhone: parsed.data.tenantPhone || tenant[0].phone,
      status: "unread",
    }).returning();

    return res.status(201).json(inquiry[0]);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/inquiries/received — landlord sees inquiries for their houses
router.get("/inquiries/received", requireAuth, async (req: any, res: any) => {
  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!user[0]) return res.status(401).json({ error: "Unauthorized" });

    const rows = await db
      .select({
        id: inquiriesTable.id,
        message: inquiriesTable.message,
        status: inquiriesTable.status,
        tenantName: inquiriesTable.tenantName,
        tenantPhone: inquiriesTable.tenantPhone,
        createdAt: inquiriesTable.createdAt,
        houseId: inquiriesTable.houseId,
        houseTitle: housesTable.title,
        houseCity: housesTable.city,
      })
      .from(inquiriesTable)
      .innerJoin(housesTable, eq(inquiriesTable.houseId, housesTable.id))
      .where(eq(inquiriesTable.landlordId, user[0].id))
      .orderBy(desc(inquiriesTable.createdAt));

    return res.json(rows);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/inquiries/sent — tenant sees inquiries they sent
router.get("/inquiries/sent", requireAuth, async (req: any, res: any) => {
  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!user[0]) return res.status(401).json({ error: "Unauthorized" });

    const rows = await db
      .select({
        id: inquiriesTable.id,
        message: inquiriesTable.message,
        status: inquiriesTable.status,
        createdAt: inquiriesTable.createdAt,
        houseId: inquiriesTable.houseId,
        houseTitle: housesTable.title,
        houseCity: housesTable.city,
        landlordName: usersTable.name,
        landlordPhone: usersTable.phone,
      })
      .from(inquiriesTable)
      .innerJoin(housesTable, eq(inquiriesTable.houseId, housesTable.id))
      .innerJoin(usersTable, eq(inquiriesTable.landlordId, usersTable.id))
      .where(eq(inquiriesTable.tenantId, user[0].id))
      .orderBy(desc(inquiriesTable.createdAt));

    return res.json(rows);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/inquiries/:id/read — landlord marks inquiry as read
router.patch("/inquiries/:id/read", requireAuth, async (req: any, res: any) => {
  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!user[0]) return res.status(401).json({ error: "Unauthorized" });

    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid inquiry ID" });
    const updated = await db
      .update(inquiriesTable)
      .set({ status: "read" })
      .where(and(eq(inquiriesTable.id, id), eq(inquiriesTable.landlordId, user[0].id)))
      .returning();

    if (!updated[0]) return res.status(404).json({ error: "Inquiry not found" });
    return res.json(updated[0]);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/inquiries/unread-count — landlord unread count for badge
router.get("/inquiries/unread-count", requireAuth, async (req: any, res: any) => {
  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!user[0]) return res.json({ count: 0 });

    const [row] = await db.select({ count: count() }).from(inquiriesTable).where(
      and(eq(inquiriesTable.landlordId, user[0].id), eq(inquiriesTable.status, "unread"))
    );

    return res.json({ count: row.count });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
