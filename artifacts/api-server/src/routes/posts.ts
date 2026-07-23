import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { postsTable } from "@workspace/db";
import { eq, desc, sql, count } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { getPostPeerClient, isPostPeerPlatform } from "../lib/postpeer";
import { logger } from "../lib/logger";

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

  try {
    const postPeer = getPostPeerClient();
    const integrationsResult = await postPeer.connect.integrations.list({
      query: { limit: 100 },
    });
    const integrations = integrationsResult.data?.integrations ?? [];
    const integrationByPlatform = new Map(
      integrations.map((integration) => [integration.platform, integration]),
    );

    const externalPlatforms = platforms.map((platform: unknown) => {
      if (typeof platform !== "string") {
        throw new Error("platforms must contain only strings");
      }
      if (!isPostPeerPlatform(platform)) {
        throw new Error(`Unsupported platform: ${platform}`);
      }
      const integration = integrationByPlatform.get(platform);
      if (!integration) {
        throw new Error(
          `No connected PostPeer integration found for ${platform}. Connect it from the Platforms page first.`,
        );
      }
      return {
        platform,
        accountId: integration.id,
      };
    });

    const externalResult = await postPeer.posts.create({
      body: {
        content,
        platforms: externalPlatforms,
        ...(mediaUrls?.length
          ? {
              mediaItems: mediaUrls.map((url: string) => ({
                type: "image" as const,
                url,
              })),
            }
          : {}),
        ...(scheduledAt
          ? { scheduledFor: new Date(scheduledAt).toISOString() }
          : { publishNow: true }),
      },
    });
    const externalPost = externalResult.data;

    if (!externalPost?.success) {
      res.status(502).json({
        error: "PostPeer could not deliver the post to any selected platform.",
        delivery: externalPost,
      });
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

    res.status(201).json({
      ...post,
      externalPostId: externalPost.postId,
      delivery: externalPost.platforms,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error({ err: error }, "PostPeer publishing request failed");
      const status = error.message.startsWith("No connected PostPeer integration")
        ? 400
        : error.message.includes("POSTPEER_API_KEY")
          ? 503
          : 502;
      res.status(status).json({ error: error.message });
      return;
    }
    res.status(502).json({ error: "PostPeer publishing request failed" });
  }
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
