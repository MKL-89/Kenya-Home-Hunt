import { pgTable, text, serial, timestamp, integer, doublePrecision, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const housesTable = pgTable("houses", {
  id: serial("id").primaryKey(),
  landlordId: integer("landlord_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  rentPrice: doublePrecision("rent_price").notNull(),
  bedrooms: integer("bedrooms").notNull().default(1),
  bathrooms: integer("bathrooms").notNull().default(1),
  propertyType: text("property_type").notNull().default(""),
  contactPhone: text("contact_phone").notNull().default(""),
  county: text("county").notNull().default(""),
  town: text("town").notNull().default(""),
  estate: text("estate").notNull().default(""),
  city: text("city").notNull().default(""),
  address: text("address").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  status: text("status").notNull().default("vacant"),
  images: text("images").array().notNull().default([]),
  amenities: text("amenities").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index("houses_landlord_id_idx").on(t.landlordId),
  index("houses_status_created_idx").on(t.status, t.createdAt),
  index("houses_location_idx").on(t.county, t.town, t.estate),
  index("houses_rent_price_idx").on(t.rentPrice),
]);

export const insertHouseSchema = createInsertSchema(housesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertHouse = z.infer<typeof insertHouseSchema>;
export type House = typeof housesTable.$inferSelect;
