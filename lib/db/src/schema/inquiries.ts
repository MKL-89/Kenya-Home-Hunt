import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { housesTable } from "./houses";

export const inquiriesTable = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => usersTable.id),
  landlordId: integer("landlord_id").notNull().references(() => usersTable.id),
  houseId: integer("house_id").notNull().references(() => housesTable.id),
  message: text("message").notNull(),
  tenantName: text("tenant_name"),
  tenantPhone: text("tenant_phone"),
  status: text("status").notNull().default("unread"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertInquirySchema = createInsertSchema(inquiriesTable).omit({ id: true, createdAt: true });
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiriesTable.$inferSelect;
