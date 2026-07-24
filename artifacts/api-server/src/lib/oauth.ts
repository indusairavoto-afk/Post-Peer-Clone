/**
 * PostMVP OAuth infrastructure — platform configs, state management, token exchange.
 * Each platform needs a developer app registered to get CLIENT_ID / CLIENT_SECRET.
 */

import crypto from "crypto";

// ── Platform config ────────────────────────────────────────────────────────

export interface PlatformConfig {
  id: string;
  name: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
  pkce?: boolean;           // Twitter requires PKCE
  requiresMedia?: boolean;  // YouTube, TikTok, Pinterest are media-first
  notes?: string;
}

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  twitter: {
    id: "twitter",
    name: "Twitter / X",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    clientIdEnv: "TWITTER_CLIENT_ID",
    clientSecretEnv: "TWITTER_CLIENT_SECRET",
    pkce: true,
  },
  instagram: {
    id: "instagram",
    name: "Instagram",
    authUrl: "https://www.facebook.com/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list", "pages_read_engagement"],
    clientIdEnv: "META_APP_ID",
    clientSecretEnv: "META_APP_SECRET",
    notes: "Requires an Instagram Business or Creator account linked to a Facebook Page.",
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    authUrl: "https://www.facebook.com/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    scopes: ["pages_manage_posts", "pages_read_engagement", "publish_to_groups"],
    clientIdEnv: "META_APP_ID",
    clientSecretEnv: "META_APP_SECRET",
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scopes: ["r_liteprofile", "r_emailaddress", "w_member_social"],
    clientIdEnv: "LINKEDIN_CLIENT_ID",
    clientSecretEnv: "LINKEDIN_CLIENT_SECRET",
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    authUrl: "https://www.tiktok.com/v2/auth/authorize",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token",
    scopes: ["user.info.basic", "video.publish", "video.upload"],
    clientIdEnv: "TIKTOK_CLIENT_KEY",
    clientSecretEnv: "TIKTOK_CLIENT_SECRET",
    requiresMedia: true,
    notes: "TikTok requires video content. Text-only posts are not supported.",
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"],
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    requiresMedia: true,
    notes: "YouTube requires video content. Text-only posts are not supported.",
  },
  pinterest: {
    id: "pinterest",
    name: "Pinterest",
    authUrl: "https://www.pinterest.com/oauth",
    tokenUrl: "https://api.pinterest.com/v5/oauth/token",
    scopes: ["boards:read", "boards:write", "pins:read", "pins:write"],
    clientIdEnv: "PINTEREST_APP_ID",
    clientSecretEnv: "PINTEREST_APP_SECRET",
    requiresMedia: true,
    notes: "Pinterest pins require an image or video.",
  },
  threads: {
    id: "threads",
    name: "Threads",
    authUrl: "https://threads.net/oauth/authorize",
    tokenUrl: "https://graph.threads.net/oauth/access_token",
    scopes: ["threads_basic", "threads_content_publish"],
    clientIdEnv: "META_APP_ID",
    clientSecretEnv: "META_APP_SECRET",
  },
  // Bluesky uses AT Protocol — handled separately (no OAuth, uses app passwords)
};

/** Returns the callback URL for a given platform. */
export function callbackUrl(platform: string): string {
  const base =
    process.env.OAUTH_CALLBACK_BASE ??
    (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:8080");
  return `${base}/api/oauth/callback/${platform}`;
}

/** Check if a platform has its OAuth credentials configured in env. */
export function isPlatformConfigured(platformId: string): boolean {
  if (platformId === "bluesky") return true; // AT Protocol — no server credentials needed
  const cfg = PLATFORM_CONFIGS[platformId];
  if (!cfg) return false;
  return !!(process.env[cfg.clientIdEnv] && process.env[cfg.clientSecretEnv]);
}

// ── PKCE helpers ───────────────────────────────────────────────────────────

export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

// ── In-memory state store (TTL 10 min) ────────────────────────────────────

interface StateEntry {
  clerkId: string;
  platform: string;
  codeVerifier?: string;
  expiresAt: number;
}

const _state = new Map<string, StateEntry>();

export function createState(clerkId: string, platform: string, codeVerifier?: string): string {
  const key = crypto.randomBytes(16).toString("hex");
  _state.set(key, { clerkId, platform, codeVerifier, expiresAt: Date.now() + 10 * 60_000 });
  // Prune expired
  for (const [k, v] of _state) {
    if (v.expiresAt < Date.now()) _state.delete(k);
  }
  return key;
}

export function consumeState(key: string): StateEntry | null {
  const entry = _state.get(key);
  if (!entry) return null;
  _state.delete(key);
  if (entry.expiresAt < Date.now()) return null;
  return entry;
}

// ── Token exchange ─────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

export async function exchangeCode(
  platform: string,
  code: string,
  codeVerifier?: string
): Promise<TokenResponse> {
  const cfg = PLATFORM_CONFIGS[platform];
  if (!cfg) throw new Error(`Unknown platform: ${platform}`);

  const clientId = process.env[cfg.clientIdEnv]!;
  const clientSecret = process.env[cfg.clientSecretEnv]!;
  const redirect = callbackUrl(platform);

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirect,
    client_id: clientId,
  });

  if (codeVerifier) {
    // PKCE — client secret not sent, code_verifier sent instead
    params.set("code_verifier", codeVerifier);
  }

  const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };

  // Non-PKCE platforms use Basic auth with client_secret
  if (!codeVerifier) {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    headers["Authorization"] = `Basic ${basic}`;
  }

  const res = await fetch(cfg.tokenUrl, {
    method: "POST",
    headers,
    body: params.toString(),
  });

  const data = await res.json() as any;
  if (!res.ok) throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  return data as TokenResponse;
}

/** Build the OAuth authorization URL for a platform. */
export function buildAuthUrl(platform: string, state: string, codeChallenge?: string): string {
  const cfg = PLATFORM_CONFIGS[platform];
  if (!cfg) throw new Error(`Unknown platform: ${platform}`);

  const clientId = process.env[cfg.clientIdEnv]!;
  const redirect = callbackUrl(platform);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirect,
    scope: cfg.scopes.join(" "),
    state,
  });

  if (codeChallenge) {
    params.set("code_challenge", codeChallenge);
    params.set("code_challenge_method", "S256");
  }

  // Platform-specific extras
  if (platform === "youtube") {
    params.set("access_type", "offline");
    params.set("prompt", "consent");
  }
  if (platform === "tiktok") {
    params.set("client_key", clientId);
    params.delete("client_id");
  }

  return `${cfg.authUrl}?${params.toString()}`;
}
