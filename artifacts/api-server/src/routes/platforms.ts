import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "../lib/auth";
import { listAccounts } from "../lib/postbridge";

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

/**
 * List connected platforms.
 * If the user has a Post Bridge API key, returns live accounts from Post Bridge.
 * Otherwise returns an empty list — no fake connections allowed.
 */
router.get("/platforms/connected", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;

  const user = await getOrCreateUser(clerkId);
  if (!user.postBridgeApiKey) {
    res.json({ platforms: [], postBridgeConfigured: false });
    return;
  }

  try {
    const accounts = await listAccounts(user.postBridgeApiKey);
    const platforms = accounts.map((acc) => ({
      id: String(acc.id),
      platform: acc.platform,
      accountName: acc.name ?? acc.username,
      accountHandle: acc.username,
      status: "connected",
      connectedAt: new Date().toISOString(),
      postBridgeAccountId: acc.id,
    }));
    res.json({ platforms, postBridgeConfigured: true });
  } catch (err: any) {
    res.status(502).json({ error: `Post Bridge error: ${err.message}` });
  }
});

export default router;
