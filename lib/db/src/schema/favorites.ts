import { pgTable, serial, integer, timestamp, unique, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { housesTable } from "./houses";

export const favoritesTable = pgTable("favorites", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  houseId: integer("house_id").notNull().references(() => housesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique().on(t.tenantId, t.houseId),
  index("favorites_house_id_idx").on(t.houseId),
]);

export const insertFavoriteSchema = createInsertSchema(favoritesTable).omit({ id: true, createdAt: true });
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favoritesTable.$inferSelect;
