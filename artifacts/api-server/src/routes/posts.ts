import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { postsTable, platformTokensTable } from "@workspace/db";
import { eq, desc, sql, count, inArray } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "../lib/auth";
import { publishToPlatform } from "../lib/publish";

const router: IRouter = Router();

router.get("/posts", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const { status, platform, limit = "50", offset = "0" } = req.query as Record<string, string>;

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
  const { content, platforms, scheduledAt, mediaUrls, tokenIds } = req.body as {
    content: string;
    platforms: string[];       // platform names e.g. ["twitter", "bluesky"]
    scheduledAt?: string | null;
    mediaUrls?: string[];
    tokenIds?: number[];       // platform_tokens.id rows to publish to
  };

  if (!content || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
    res.status(400).json({ error: "content and platforms are required" });
    return;
  }
  if (scheduledAt && new Date(scheduledAt) <= new Date()) {
    res.status(400).json({ error: "scheduledAt must be a future date" });
    return;
  }

  // Determine status and save local record first
  const isScheduled = !!scheduledAt;
  const [post] = await db.insert(postsTable).values({
    userId: clerkId,
    content,
    platforms,
    status: isScheduled ? "scheduled" : "published",
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    publishedAt: isScheduled ? null : new Date(),
    mediaUrls: mediaUrls ?? [],
  }).returning();

  // If we have token IDs and it's a "post now", publish to each platform
  if (!isScheduled && tokenIds && tokenIds.length > 0) {
    const tokens = await db
      .select()
      .from(platformTokensTable)
      .where(
        sql`${platformTokensTable.id} = ANY(ARRAY[${sql.join(tokenIds.map(id => sql`${id}`), sql`, `)}]::int[])
          AND ${platformTokensTable.userId} = ${clerkId}`
      );

    const results = await Promise.allSettled(
      tokens.map((tok) => publishToPlatform(tok, content, mediaUrls))
    );

    const failures = results
      .map((r) => (r.status === "fulfilled" ? r.value : { success: false, error: (r as any).reason?.message }))
      .filter((r) => !r.success);

    if (failures.length === tokens.length && tokens.length > 0) {
      // All failed — mark post as failed
      await db.update(postsTable).set({ status: "failed" }).where(eq(postsTable.id, post.id));
      res.status(502).json({
        post: { ...post, status: "failed" },
        errors: failures.map((f) => ({ platform: f.platform, error: f.error })),
      });
      return;
    }

    res.status(201).json({
      post,
      results: results.map((r) => (r.status === "fulfilled" ? r.value : { success: false, error: (r as any).reason?.message })),
    });
    return;
  }

  res.status(201).json({ post });
});

router.get("/posts/:id", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);

  const [post] = await db.select().from(postsTable)
    .where(sql`${postsTable.id} = ${id} AND ${postsTable.userId} = ${clerkId}`);

  if (!post) { res.status(404).json({ error: "Post not found" }); return; }
  res.json(post);
});

router.delete("/posts/:id", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);

  const [deleted] = await db.delete(postsTable)
    .where(sql`${postsTable.id} = ${id} AND ${postsTable.userId} = ${clerkId}`)
    .returning();

  if (!deleted) { res.status(404).json({ error: "Post not found" }); return; }
  res.sendStatus(204);
});

export default router;
