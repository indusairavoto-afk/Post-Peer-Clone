/**
 * PostMVP OAuth routes.
 * GET  /api/oauth/start/:platform    → redirects to provider OAuth page
 * GET  /api/oauth/callback/:platform → exchanges code, stores token, redirects to /platforms
 * POST /api/oauth/bluesky/connect    → Bluesky AT Protocol session (app password flow)
 * DELETE /api/oauth/:platform/disconnect → removes stored token
 */

import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { platformTokensTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "../lib/auth";
import {
  PLATFORM_CONFIGS,
  isPlatformConfigured,
  callbackUrl,
  buildAuthUrl,
  createState,
  consumeState,
  exchangeCode,
  generateCodeVerifier,
  generateCodeChallenge,
} from "../lib/oauth";

const router: IRouter = Router();

/** Redirect to the platform OAuth authorization page. */
router.get("/oauth/start/:platform", requireAuth, async (req, res): Promise<void> => {
  const platform = req.params.platform as string;
  const clerkId = (req as any).clerkId;

  if (platform === "bluesky") {
    res.status(400).json({ error: "Bluesky uses app passwords, not OAuth. Use POST /api/oauth/bluesky/connect" });
    return;
  }

  if (!isPlatformConfigured(platform)) {
    res.status(503).json({
      error: `${platform} is not configured yet. Set ${PLATFORM_CONFIGS[platform]?.clientIdEnv ?? "the required env vars"} in your environment.`,
      platform,
      requiredEnvVars: [
        PLATFORM_CONFIGS[platform]?.clientIdEnv,
        PLATFORM_CONFIGS[platform]?.clientSecretEnv,
      ].filter(Boolean),
    });
    return;
  }

  const cfg = PLATFORM_CONFIGS[platform];
  if (!cfg) {
    res.status(400).json({ error: `Unknown platform: ${platform}` });
    return;
  }

  let codeVerifier: string | undefined;
  if (cfg.pkce) {
    codeVerifier = generateCodeVerifier();
  }

  const state = createState(clerkId, platform, codeVerifier);
  const authUrl = buildAuthUrl(platform, state, codeVerifier ? generateCodeChallenge(codeVerifier) : undefined);

  res.redirect(authUrl);
});

/** OAuth callback — exchange code for token, store it, redirect to /platforms. */
router.get("/oauth/callback/:platform", async (req, res): Promise<void> => {
  const platform = req.params.platform as string;
  const { code, state, error: oauthError } = req.query as Record<string, string>;

  const frontendBase =
    process.env.OAUTH_CALLBACK_BASE ??
    (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "");

  if (oauthError) {
    res.redirect(`${frontendBase}/platforms?error=${encodeURIComponent(oauthError)}`);
    return;
  }

  const stateEntry = consumeState(state);
  if (!stateEntry) {
    res.redirect(`${frontendBase}/platforms?error=invalid_state`);
    return;
  }

  try {
    const tokens = await exchangeCode(platform, code, stateEntry.codeVerifier);
    const accountInfo = await fetchAccountInfo(platform, tokens.access_token);

    await db
      .delete(platformTokensTable)
      .where(and(eq(platformTokensTable.userId, stateEntry.clerkId), eq(platformTokensTable.platform, platform)));

    await db.insert(platformTokensTable).values({
      userId: stateEntry.clerkId,
      platform,
      accountId: accountInfo.id,
      accountHandle: accountInfo.handle,
      accountName: accountInfo.name,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
      scope: tokens.scope ?? null,
    });

    res.redirect(`${frontendBase}/platforms?connected=${platform}`);
  } catch (err: any) {
    res.redirect(`${frontendBase}/platforms?error=${encodeURIComponent(err.message)}`);
  }
});

/** Bluesky — AT Protocol app password connection. */
router.post("/oauth/bluesky/connect", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const { identifier, appPassword } = req.body as { identifier?: string; appPassword?: string };

  if (!identifier || !appPassword) {
    res.status(400).json({ error: "identifier and appPassword are required" });
    return;
  }

  try {
    const sessionRes = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: identifier.replace(/^@/, ""), password: appPassword }),
    });

    const session = await sessionRes.json() as any;
    if (!sessionRes.ok) {
      res.status(400).json({ error: session?.message ?? "Invalid Bluesky credentials" });
      return;
    }

    await db
      .delete(platformTokensTable)
      .where(and(eq(platformTokensTable.userId, clerkId), eq(platformTokensTable.platform, "bluesky")));

    const [row] = await db.insert(platformTokensTable).values({
      userId: clerkId,
      platform: "bluesky",
      accountId: session.did,
      accountHandle: session.handle,
      accountName: session.displayName ?? session.handle,
      accessToken: session.accessJwt,
      refreshToken: session.refreshJwt,
      expiresAt: null,
      scope: null,
    }).returning();

    res.status(201).json({
      id: String(row.id),
      platform: "bluesky",
      accountHandle: row.accountHandle,
      accountName: row.accountName,
      status: "connected",
      connectedAt: row.createdAt.toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/** Disconnect a platform by removing its stored token. */
router.delete("/oauth/:platform/disconnect", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const platform = req.params.platform as string;

  await db
    .delete(platformTokensTable)
    .where(and(eq(platformTokensTable.userId, clerkId), eq(platformTokensTable.platform, platform)));

  res.sendStatus(204);
});

// ── Account info fetchers ─────────────────────────────────────────────────

async function fetchAccountInfo(platform: string, accessToken: string): Promise<{ id: string; handle: string; name: string }> {
  switch (platform) {
    case "twitter": {
      const res = await fetch("https://api.twitter.com/2/users/me?user.fields=name,username", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json() as any;
      return { id: data.data.id, handle: data.data.username, name: data.data.name };
    }
    case "linkedin": {
      const res = await fetch("https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName)", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json() as any;
      return { id: data.id, handle: data.id, name: `${data.localizedFirstName} ${data.localizedLastName}` };
    }
    case "facebook":
    case "instagram":
    case "threads": {
      const res = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${accessToken}`);
      const data = await res.json() as any;
      return { id: data.id, handle: data.id, name: data.name };
    }
    case "pinterest": {
      const res = await fetch("https://api.pinterest.com/v5/user_account", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json() as any;
      return { id: data.account_type ?? data.username, handle: data.username, name: data.username };
    }
    case "youtube": {
      const res = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json() as any;
      const ch = data.items?.[0];
      return { id: ch?.id ?? "", handle: ch?.snippet?.customUrl ?? ch?.id ?? "", name: ch?.snippet?.title ?? "" };
    }
    case "tiktok": {
      const res = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json() as any;
      const u = data.data?.user;
      return { id: u?.open_id ?? "", handle: u?.username ?? u?.open_id ?? "", name: u?.display_name ?? "" };
    }
    default:
      return { id: "unknown", handle: "unknown", name: "" };
  }
}

export default router;
