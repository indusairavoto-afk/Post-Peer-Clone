import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const platformTokensTable = pgTable("platform_tokens", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  platform: text("platform").notNull(),
  accountId: text("account_id").notNull(),      // Provider's user/page/DID ID
  accountHandle: text("account_handle").notNull(),
  accountName: text("account_name").notNull().default(""),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  scope: text("scope"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type PlatformToken = typeof platformTokensTable.$inferSelect;
