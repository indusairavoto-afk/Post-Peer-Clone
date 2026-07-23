import PostPeer, { PostPeerError } from "@postpeer/node";

const POSTPEER_API_KEY_ENV = "POSTPEER_API_KEY";

export const POSTPEER_PLATFORMS = [
  "twitter",
  "instagram",
  "youtube",
  "tiktok",
  "pinterest",
  "linkedin",
  "bluesky",
  "facebook",
  "threads",
] as const;

export type PostPeerPlatform = (typeof POSTPEER_PLATFORMS)[number];

export function isPostPeerPlatform(value: string): value is PostPeerPlatform {
  return (POSTPEER_PLATFORMS as readonly string[]).includes(value);
}

export const isPostPeerConfigured = (): boolean =>
  Boolean(process.env[POSTPEER_API_KEY_ENV]?.trim());

export function getPostPeerClient(): PostPeer {
  const apiKey = process.env[POSTPEER_API_KEY_ENV]?.trim();
  if (!apiKey) {
    throw new PostPeerError(
      `${POSTPEER_API_KEY_ENV} is required to connect and publish through the PostPeer API.`,
    );
  }

  return new PostPeer({ apiKey });
}

export function getPostPeerOrigin(req: {
  protocol: string;
  get(name: string): string | undefined;
}): string {
  const protocol = req.get("x-forwarded-proto")?.split(",")[0]?.trim() || req.protocol;
  const host = req.get("x-forwarded-host") || req.get("host");
  if (!host) {
    throw new PostPeerError("Unable to determine the public host for the OAuth callback.");
  }
  return `${protocol}://${host}`;
}