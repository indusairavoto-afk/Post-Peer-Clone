import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const connectedPlatformsTable = pgTable("connected_platforms", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  platform: text("platform").notNull(),
  accountName: text("account_name").notNull(),
  accountHandle: text("account_handle").notNull(),
  status: text("status").notNull().default("unverified"),
  connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertConnectedPlatformSchema = createInsertSchema(connectedPlatformsTable).omit({ id: true, connectedAt: true });
export type InsertConnectedPlatform = z.infer<typeof insertConnectedPlatformSchema>;
export type ConnectedPlatform = typeof connectedPlatformsTable.$inferSelect;
