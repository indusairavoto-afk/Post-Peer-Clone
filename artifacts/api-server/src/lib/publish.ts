/**
 * PostMVP — per-platform publish functions.
 * Each function takes a stored PlatformToken and posts content directly to that platform's API.
 */

import type { PlatformToken } from "@workspace/db";

export interface PublishResult {
  platform: string;
  success: boolean;
  externalId?: string;
  error?: string;
}

// ── Twitter / X ────────────────────────────────────────────────────────────

export async function publishToTwitter(
  token: PlatformToken,
  caption: string
): Promise<PublishResult> {
  try {
    const res = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: caption.slice(0, 280) }),
    });
    const data = await res.json() as any;
    if (!res.ok) throw new Error(data?.detail ?? JSON.stringify(data));
    return { platform: "twitter", success: true, externalId: data?.data?.id };
  } catch (err: any) {
    return { platform: "twitter", success: false, error: err.message };
  }
}

// ── LinkedIn ───────────────────────────────────────────────────────────────

export async function publishToLinkedIn(
  token: PlatformToken,
  caption: string
): Promise<PublishResult> {
  try {
    const urn = `urn:li:person:${token.accountId}`;
    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: urn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: caption.slice(0, 3000) },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    });
    const data = await res.json() as any;
    if (!res.ok) throw new Error(data?.message ?? JSON.stringify(data));
    const id = res.headers.get("x-restli-id") ?? data?.id;
    return { platform: "linkedin", success: true, externalId: id };
  } catch (err: any) {
    return { platform: "linkedin", success: false, error: err.message };
  }
}

// ── Threads ────────────────────────────────────────────────────────────────

export async function publishToThreads(
  token: PlatformToken,
  caption: string
): Promise<PublishResult> {
  try {
    // Step 1: Create a container
    const createRes = await fetch(
      `https://graph.threads.net/v1.0/${token.accountId}/threads`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_type: "TEXT",
          text: caption.slice(0, 500),
          access_token: token.accessToken,
        }),
      }
    );
    const createData = await createRes.json() as any;
    if (!createRes.ok) throw new Error(createData?.error?.message ?? JSON.stringify(createData));

    // Step 2: Publish the container
    const pubRes = await fetch(
      `https://graph.threads.net/v1.0/${token.accountId}/threads_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: createData.id,
          access_token: token.accessToken,
        }),
      }
    );
    const pubData = await pubRes.json() as any;
    if (!pubRes.ok) throw new Error(pubData?.error?.message ?? JSON.stringify(pubData));
    return { platform: "threads", success: true, externalId: pubData?.id };
  } catch (err: any) {
    return { platform: "threads", success: false, error: err.message };
  }
}

// ── Facebook (Page posts) ──────────────────────────────────────────────────

export async function publishToFacebook(
  token: PlatformToken,
  caption: string
): Promise<PublishResult> {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${token.accountId}/feed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: caption, access_token: token.accessToken }),
      }
    );
    const data = await res.json() as any;
    if (!res.ok) throw new Error(data?.error?.message ?? JSON.stringify(data));
    return { platform: "facebook", success: true, externalId: data?.id };
  } catch (err: any) {
    return { platform: "facebook", success: false, error: err.message };
  }
}

// ── Instagram (requires Business + Graph API) ──────────────────────────────

export async function publishToInstagram(
  token: PlatformToken,
  caption: string,
  imageUrl?: string
): Promise<PublishResult> {
  if (!imageUrl) {
    return { platform: "instagram", success: false, error: "Instagram requires an image URL for publishing." };
  }
  try {
    // Step 1: Create media container
    const containerRes = await fetch(
      `https://graph.facebook.com/v19.0/${token.accountId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl,
          caption,
          access_token: token.accessToken,
        }),
      }
    );
    const containerData = await containerRes.json() as any;
    if (!containerRes.ok) throw new Error(containerData?.error?.message ?? JSON.stringify(containerData));

    // Step 2: Publish container
    const pubRes = await fetch(
      `https://graph.facebook.com/v19.0/${token.accountId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: token.accessToken,
        }),
      }
    );
    const pubData = await pubRes.json() as any;
    if (!pubRes.ok) throw new Error(pubData?.error?.message ?? JSON.stringify(pubData));
    return { platform: "instagram", success: true, externalId: pubData?.id };
  } catch (err: any) {
    return { platform: "instagram", success: false, error: err.message };
  }
}

// ── Bluesky (AT Protocol) ──────────────────────────────────────────────────

export async function publishToBluesky(
  token: PlatformToken,
  caption: string
): Promise<PublishResult> {
  try {
    const res = await fetch("https://bsky.social/xrpc/com.atproto.repo.createRecord", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repo: token.accountId,   // DID
        collection: "app.bsky.feed.post",
        record: {
          $type: "app.bsky.feed.post",
          text: caption.slice(0, 300),
          createdAt: new Date().toISOString(),
          langs: ["en"],
        },
      }),
    });
    const data = await res.json() as any;
    if (!res.ok) throw new Error(data?.message ?? JSON.stringify(data));
    return { platform: "bluesky", success: true, externalId: data?.uri };
  } catch (err: any) {
    return { platform: "bluesky", success: false, error: err.message };
  }
}

// ── Pinterest ──────────────────────────────────────────────────────────────

export async function publishToPinterest(
  token: PlatformToken,
  caption: string,
  imageUrl?: string
): Promise<PublishResult> {
  if (!imageUrl) {
    return { platform: "pinterest", success: false, error: "Pinterest requires an image URL." };
  }
  try {
    const res = await fetch("https://api.pinterest.com/v5/pins", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: caption.slice(0, 100),
        description: caption,
        media_source: { source_type: "image_url", url: imageUrl },
      }),
    });
    const data = await res.json() as any;
    if (!res.ok) throw new Error(data?.message ?? JSON.stringify(data));
    return { platform: "pinterest", success: true, externalId: data?.id };
  } catch (err: any) {
    return { platform: "pinterest", success: false, error: err.message };
  }
}

// ── Dispatcher ─────────────────────────────────────────────────────────────

export async function publishToPlatform(
  token: PlatformToken,
  caption: string,
  mediaUrls?: string[]
): Promise<PublishResult> {
  const imageUrl = mediaUrls?.[0];
  switch (token.platform) {
    case "twitter":   return publishToTwitter(token, caption);
    case "linkedin":  return publishToLinkedIn(token, caption);
    case "threads":   return publishToThreads(token, caption);
    case "facebook":  return publishToFacebook(token, caption);
    case "instagram": return publishToInstagram(token, caption, imageUrl);
    case "bluesky":   return publishToBluesky(token, caption);
    case "pinterest": return publishToPinterest(token, caption, imageUrl);
    case "tiktok":
      return { platform: "tiktok", success: false, error: "TikTok requires video upload via the TikTok app or direct API video upload. Text-only posts are not supported." };
    case "youtube":
      return { platform: "youtube", success: false, error: "YouTube requires video content. Text-only posts are not supported." };
    default:
      return { platform: token.platform, success: false, error: "Publishing not yet implemented for this platform." };
  }
}
