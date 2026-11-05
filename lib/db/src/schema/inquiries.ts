import { pgTable, text, serial, timestamp, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { housesTable } from "./houses";

export const inquiriesTable = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  landlordId: integer("landlord_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  houseId: integer("house_id").notNull().references(() => housesTable.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  tenantName: text("tenant_name"),
  tenantPhone: text("tenant_phone"),
  status: text("status").notNull().default("unread"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("inquiries_landlord_status_idx").on(t.landlordId, t.status),
  index("inquiries_tenant_id_idx").on(t.tenantId),
  index("inquiries_house_id_idx").on(t.houseId),
]);

export const insertInquirySchema = createInsertSchema(inquiriesTable).omit({ id: true, createdAt: true });
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiriesTable.$inferSelect;
