import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  platforms: text("platforms").array().notNull().default([]),
  status: text("status").notNull().default("published"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  mediaUrls: text("media_urls").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof postsTable.$inferSelect;
