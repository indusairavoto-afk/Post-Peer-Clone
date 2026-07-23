import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { postsTable } from "@workspace/db";
import { eq, desc, sql, count } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/posts", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const { status, platform, limit = "50", offset = "0" } = req.query as Record<string, string>;

  let query = db.select().from(postsTable).where(eq(postsTable.userId, clerkId));

  const posts = await db.select().from(postsTable)
    .where(sql`${postsTable.userId} = ${clerkId}
      ${status ? sql` AND ${postsTable.status} = ${status}` : sql``}
      ${platform ? sql` AND ${platform} = ANY(${postsTable.platforms})` : sql``}
    `)
    .orderBy(desc(postsTable.createdAt))
    .limit(Number(limit))
    .offset(Number(offset));

  const [{ count: total }] = await db.select({ count: count() }).from(postsTable)
    .where(sql`${postsTable.userId} = ${clerkId}
      ${status ? sql` AND ${postsTable.status} = ${status}` : sql``}
    `);

  res.json({ posts, total: Number(total) });
});

router.post("/posts", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const { content, platforms, scheduledAt, mediaUrls } = req.body;

  if (!content || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
    res.status(400).json({ error: "content and platforms are required" });
    return;
  }

  if (scheduledAt && new Date(scheduledAt) <= new Date()) {
    res.status(400).json({ error: "scheduledAt must be a future date" });
    return;
  }

  const status = scheduledAt ? "scheduled" : "published";
  const publishedAt = scheduledAt ? null : new Date();

  const [post] = await db.insert(postsTable).values({
    userId: clerkId,
    content,
    platforms,
    status,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    publishedAt,
    mediaUrls: mediaUrls ?? [],
  }).returning();

  res.status(201).json(post);
});

router.get("/posts/:id", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [post] = await db.select().from(postsTable)
    .where(sql`${postsTable.id} = ${id} AND ${postsTable.userId} = ${clerkId}`);

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(post);
});

router.delete("/posts/:id", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [deleted] = await db.delete(postsTable)
    .where(sql`${postsTable.id} = ${id} AND ${postsTable.userId} = ${clerkId}`)
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
