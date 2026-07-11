import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    req.log.warn({ authDebug: JSON.stringify(auth) }, "requireAuth: no userId — rejecting 401");
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.clerkUserId = userId;
  next();
};

// GET /api/users/me
router.get("/users/me", requireAuth, async (req: any, res: any) => {
  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (!user[0]) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(user[0]);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/users/me — upsert
router.put("/users/me", requireAuth, async (req: any, res: any) => {
  try {
    const { email, name, phone, role } = req.body;
    const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    let user;
    if (existing[0]) {
      const updated = await db
        .update(usersTable)
        .set({ email, name, phone, role, updatedAt: new Date() })
        .where(eq(usersTable.clerkId, req.clerkUserId))
        .returning();
      user = updated[0];
    } else {
      const created = await db
        .insert(usersTable)
        .values({ clerkId: req.clerkUserId, email, name, phone, role: role || "tenant" })
        .returning();
      user = created[0];
    }
    return res.json(user);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export { requireAuth };
export default router;
