import { pgTable, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const favoritesTable = pgTable("favorites", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  houseId: integer("house_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [unique().on(t.tenantId, t.houseId)]);

export const insertFavoriteSchema = createInsertSchema(favoritesTable).omit({ id: true, createdAt: true });
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favoritesTable.$inferSelect;
