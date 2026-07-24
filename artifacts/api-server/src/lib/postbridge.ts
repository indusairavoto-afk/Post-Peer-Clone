/**
 * Post Bridge API client
 * https://api.post-bridge.com/reference
 */

const PB_BASE = "https://api.post-bridge.com";

export interface PBAccount {
  id: number;
  platform: string;
  username: string;
  name?: string;
  avatar_url?: string;
}

export interface PBPost {
  id: string;
  status: string;
  caption: string;
  scheduled_at?: string;
}

async function pbFetch<T>(
  apiKey: string,
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${PB_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok) {
    throw new Error(`Post Bridge API error (${res.status}): ${JSON.stringify(data)}`);
  }
  return data as T;
}

/** Verify that an API key is valid by calling the accounts endpoint. */
export async function verifyApiKey(apiKey: string): Promise<boolean> {
  try {
    await pbFetch(apiKey, "GET", "/v1/social-accounts");
    return true;
  } catch {
    return false;
  }
}

/** List all connected social accounts for this Post Bridge key. */
export async function listAccounts(apiKey: string): Promise<PBAccount[]> {
  const data = await pbFetch<{ data: PBAccount[] }>(apiKey, "GET", "/v1/social-accounts");
  return data.data ?? [];
}

/** Publish or schedule a post via Post Bridge. */
export async function createPost(
  apiKey: string,
  params: {
    caption: string;
    socialAccountIds: number[];
    scheduledAt?: string | null;
    mediaUrls?: string[];
  }
): Promise<PBPost> {
  const body: Record<string, unknown> = {
    caption: params.caption,
    social_accounts: params.socialAccountIds,
  };

  if (params.scheduledAt) {
    body.scheduled_at = params.scheduledAt;
  }

  if (params.mediaUrls && params.mediaUrls.length > 0) {
    // Post Bridge accepts direct media URLs via media_urls field
    body.media_urls = params.mediaUrls;
  }

  return pbFetch<PBPost>(apiKey, "POST", "/v1/posts", body);
}
