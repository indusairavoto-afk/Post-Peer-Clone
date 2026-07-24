import { Router, type IRouter } from "express";
import { requireAuth, getOrCreateUser } from "../lib/auth";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { verifyApiKey } from "../lib/postbridge";

const router: IRouter = Router();

router.get("/user/profile", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const auth = getAuth(req);

  const user = await getOrCreateUser(
    clerkId,
    (auth as any)?.sessionClaims?.email ?? "",
    (auth as any)?.sessionClaims?.name ?? ""
  );

  const { postBridgeApiKey, ...safeUser } = user;
  res.json({ ...safeUser, hasPostBridgeKey: !!postBridgeApiKey });
});

router.put("/user/settings", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const { postBridgeApiKey } = req.body as { postBridgeApiKey?: string | null };

  // Ensure user row exists
  await getOrCreateUser(clerkId);

  if (postBridgeApiKey) {
    const valid = await verifyApiKey(postBridgeApiKey);
    if (!valid) {
      res.status(400).json({ error: "Invalid Post Bridge API key. Check your key at post-bridge.com/dashboard/api-keys" });
      return;
    }
  }

  const [updated] = await db
    .update(usersTable)
    .set({ postBridgeApiKey: postBridgeApiKey || null })
    .where(eq(usersTable.clerkId, clerkId))
    .returning();

  const { postBridgeApiKey: _key, ...safeUser } = updated;
  res.json({ ...safeUser, hasPostBridgeKey: !!updated.postBridgeApiKey });
});

export default router;
