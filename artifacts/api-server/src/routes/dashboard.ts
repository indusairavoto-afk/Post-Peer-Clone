import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { postsTable, connectedPlatformsTable, apiKeysTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "../lib/auth";

const router: IRouter = Router();

router.get("/dashboard/stats", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const user = await getOrCreateUser(clerkId);

  const [totalResult] = await db.select({ count: count() }).from(postsTable).where(eq(postsTable.userId, clerkId));
  const [publishedResult] = await db.select({ count: count() }).from(postsTable).where(sql`${postsTable.userId} = ${clerkId} AND ${postsTable.status} = 'published'`);
  const [scheduledResult] = await db.select({ count: count() }).from(postsTable).where(sql`${postsTable.userId} = ${clerkId} AND ${postsTable.status} = 'scheduled'`);
  const [failedResult] = await db.select({ count: count() }).from(postsTable).where(sql`${postsTable.userId} = ${clerkId} AND ${postsTable.status} = 'failed'`);
  const [connectedResult] = await db.select({ count: count() }).from(connectedPlatformsTable).where(sql`${connectedPlatformsTable.userId} = ${clerkId} AND ${connectedPlatformsTable.status} = 'connected'`);

  const planCredits: Record<string, number> = { free: 20, starter: 2000, standard: 6000, pro: 20000 };
  const creditsTotal = planCredits[user.plan] ?? 20;
  const creditsUsed = Number(publishedResult.count) * 2;

  res.json({
    totalPosts: Number(totalResult.count),
    publishedPosts: Number(publishedResult.count),
    scheduledPosts: Number(scheduledResult.count),
    failedPosts: Number(failedResult.count),
    connectedPlatforms: Number(connectedResult.count),
    totalDeliveries: Number(publishedResult.count) * 2,
    creditsUsed,
    creditsTotal,
  });
});

export default router;
