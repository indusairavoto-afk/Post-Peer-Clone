import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { platformTokensTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "../lib/auth";
import { isPlatformConfigured, PLATFORM_CONFIGS } from "../lib/oauth";

export const ALL_PLATFORMS = [
  { id: "twitter",   name: "Twitter / X", color: "#1DA1F2", maxLength: 280,   supportsMedia: true,  requiresMedia: false },
  { id: "instagram", name: "Instagram",   color: "#E1306C", maxLength: 2200,  supportsMedia: true,  requiresMedia: true  },
  { id: "facebook",  name: "Facebook",    color: "#1877F2", maxLength: 63206, supportsMedia: true,  requiresMedia: false },
  { id: "linkedin",  name: "LinkedIn",    color: "#0A66C2", maxLength: 3000,  supportsMedia: true,  requiresMedia: false },
  { id: "tiktok",    name: "TikTok",      color: "#69C9D0", maxLength: 2200,  supportsMedia: true,  requiresMedia: true  },
  { id: "youtube",   name: "YouTube",     color: "#FF0000", maxLength: 5000,  supportsMedia: true,  requiresMedia: true  },
  { id: "pinterest", name: "Pinterest",   color: "#E60023", maxLength: 500,   supportsMedia: true,  requiresMedia: true  },
  { id: "bluesky",   name: "Bluesky",     color: "#0085FF", maxLength: 300,   supportsMedia: false, requiresMedia: false },
  { id: "threads",   name: "Threads",     color: "#aaaaaa", maxLength: 500,   supportsMedia: true,  requiresMedia: false },
];

const router: IRouter = Router();

router.get("/platforms", async (_req, res): Promise<void> => {
  const platforms = ALL_PLATFORMS.map((p) => ({
    ...p,
    oauthConfigured: isPlatformConfigured(p.id),
    oauthStartUrl: `/api/oauth/start/${p.id}`,
    requiredEnvVars: p.id !== "bluesky"
      ? [PLATFORM_CONFIGS[p.id]?.clientIdEnv, PLATFORM_CONFIGS[p.id]?.clientSecretEnv].filter(Boolean)
      : [],
  }));
  res.json({ platforms });
});

router.get("/platforms/connected", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;

  const rows = await db
    .select()
    .from(platformTokensTable)
    .where(eq(platformTokensTable.userId, clerkId));

  const platforms = rows.map((r) => ({
    id: String(r.id),
    platform: r.platform,
    accountName: r.accountName,
    accountHandle: r.accountHandle,
    status: "connected",
    connectedAt: r.createdAt.toISOString(),
  }));

  res.json({ platforms });
});

export default router;
