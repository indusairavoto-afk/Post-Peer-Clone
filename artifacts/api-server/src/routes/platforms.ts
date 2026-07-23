import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { connectedPlatformsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import {
  getPostPeerClient,
  getPostPeerOrigin,
  isPostPeerPlatform,
} from "../lib/postpeer";
import { logger } from "../lib/logger";

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
  try {
    const result = await getPostPeerClient().connect.integrations.list({
      query: { limit: 100 },
    });
    const platforms = (result.data?.integrations ?? []).map((integration) => ({
      id: integration.id,
      platform: integration.platform,
      accountName: integration.displayName || integration.username || integration.platform,
      accountHandle: integration.username || integration.platform,
      status: "connected" as const,
      connectedAt: integration.createdAt,
    }));
    res.json({ platforms });
  } catch (error) {
    if (error instanceof Error) {
      logger.error({ err: error }, "PostPeer integrations request failed");
      res.status(error.message.includes("POSTPEER_API_KEY") ? 503 : 502).json({
        error: error.message,
      });
      return;
    }
    res.status(502).json({ error: "PostPeer integrations request failed" });
  }
});

router.get("/platforms/:platform/oauth-url", requireAuth, async (req, res): Promise<void> => {
  const platform = Array.isArray(req.params.platform) ? req.params.platform[0] : req.params.platform;
  if (!isPostPeerPlatform(platform)) {
    res.status(400).json({ error: `Unsupported platform: ${platform}` });
    return;
  }

  try {
    const origin = getPostPeerOrigin(req);
    const result = await getPostPeerClient().connect.getOAuthUrl({
      path: { platform },
      query: {
        redirectUri: `${origin}/platforms?connected=${encodeURIComponent(platform)}`,
        cancelRedirectUri: `${origin}/platforms?connect_cancelled=${encodeURIComponent(platform)}`,
      },
    });
    res.json({ url: result.data?.url });
  } catch (error) {
    if (error instanceof Error) {
      logger.error({ err: error }, "PostPeer OAuth URL request failed");
      res.status(error.message.includes("POSTPEER_API_KEY") ? 503 : 502).json({
        error: error.message,
      });
      return;
    }
    res.status(502).json({ error: "PostPeer OAuth URL request failed" });
  }
});

router.delete("/platforms/:platform/disconnect", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const platform = Array.isArray(req.params.platform) ? req.params.platform[0] : req.params.platform;

  if (!isPostPeerPlatform(platform)) {
    res.status(400).json({ error: `Unsupported platform: ${platform}` });
    return;
  }

  try {
    const integrations = await getPostPeerClient().connect.integrations.list({
      query: { platform, limit: 100 },
    });
    for (const integration of integrations.data?.integrations ?? []) {
      await getPostPeerClient().connect.integrations.disconnect({
        path: { id: integration.id },
      });
    }

    await db.delete(connectedPlatformsTable)
      .where(sql`${connectedPlatformsTable.userId} = ${clerkId} AND ${connectedPlatformsTable.platform} = ${platform}`);

    res.sendStatus(204);
  } catch (error) {
    if (error instanceof Error) {
      logger.error({ err: error }, "PostPeer disconnect request failed");
      res.status(error.message.includes("POSTPEER_API_KEY") ? 503 : 502).json({
        error: error.message,
      });
      return;
    }
    res.status(502).json({ error: "PostPeer disconnect request failed" });
  }
});

export default router;
