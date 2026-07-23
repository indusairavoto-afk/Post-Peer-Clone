import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { connectedPlatformsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const ALL_PLATFORMS = [
  { id: "twitter", name: "Twitter / X", icon: "FaTwitter", color: "#1DA1F2", maxLength: 280, supportsMedia: true },
  { id: "instagram", name: "Instagram", icon: "FaInstagram", color: "#E1306C", maxLength: 2200, supportsMedia: true },
  { id: "facebook", name: "Facebook", icon: "FaFacebook", color: "#1877F2", maxLength: 63206, supportsMedia: true },
  { id: "linkedin", name: "LinkedIn", icon: "FaLinkedin", color: "#0A66C2", maxLength: 3000, supportsMedia: true },
  { id: "tiktok", name: "TikTok", icon: "FaTiktok", color: "#69C9D0", maxLength: 2200, supportsMedia: true },
  { id: "youtube", name: "YouTube", icon: "FaYoutube", color: "#FF0000", maxLength: 5000, supportsMedia: true },
  { id: "pinterest", name: "Pinterest", icon: "FaPinterest", color: "#E60023", maxLength: 500, supportsMedia: true },
  { id: "bluesky", name: "Bluesky", icon: "SiBluesky", color: "#0085FF", maxLength: 300, supportsMedia: true },
  { id: "threads", name: "Threads", icon: "SiThreads", color: "#ffffff", maxLength: 500, supportsMedia: true },
];

const router: IRouter = Router();

router.get("/platforms", async (_req, res): Promise<void> => {
  res.json({ platforms: ALL_PLATFORMS });
});

router.get("/platforms/connected", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const platforms = await db.select().from(connectedPlatformsTable)
    .where(sql`${connectedPlatformsTable.userId} = ${clerkId} AND ${connectedPlatformsTable.status} = 'connected'`);
  res.json({ platforms });
});

router.post("/platforms/connect", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const { platform, accountName, accountHandle } = req.body;

  if (!platform || !accountName || !accountHandle) {
    res.status(400).json({ error: "platform, accountName, and accountHandle are required" });
    return;
  }

  await db.delete(connectedPlatformsTable)
    .where(sql`${connectedPlatformsTable.userId} = ${clerkId} AND ${connectedPlatformsTable.platform} = ${platform}`);

  const [connected] = await db.insert(connectedPlatformsTable).values({
    userId: clerkId,
    platform,
    accountName,
    accountHandle: accountHandle.replace(/^@/, ""),
    status: "connected",
  }).returning();

  res.status(201).json(connected);
});

router.delete("/platforms/:platform/disconnect", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const platform = Array.isArray(req.params.platform) ? req.params.platform[0] : req.params.platform;

  await db.delete(connectedPlatformsTable)
    .where(sql`${connectedPlatformsTable.userId} = ${clerkId} AND ${connectedPlatformsTable.platform} = ${platform}`);

  res.sendStatus(204);
});

export default router;
