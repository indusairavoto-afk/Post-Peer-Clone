import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { apiKeysTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { createHash, randomBytes } from "crypto";

const router: IRouter = Router();

router.get("/api-keys", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const keys = await db.select({
    id: apiKeysTable.id,
    name: apiKeysTable.name,
    keyPrefix: apiKeysTable.keyPrefix,
    lastUsedAt: apiKeysTable.lastUsedAt,
    createdAt: apiKeysTable.createdAt,
    active: apiKeysTable.active,
  }).from(apiKeysTable)
    .where(sql`${apiKeysTable.userId} = ${clerkId} AND ${apiKeysTable.active} = true`);
  res.json({ keys });
});

router.post("/api-keys", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const rawKey = `pp_${randomBytes(32).toString("hex")}`;
  const keyPrefix = rawKey.slice(0, 12);
  const keyHash = createHash("sha256").update(rawKey).digest("hex");

  const [key] = await db.insert(apiKeysTable).values({
    userId: clerkId,
    name,
    keyPrefix,
    keyHash,
    active: true,
  }).returning();

  res.status(201).json({
    id: key.id,
    name: key.name,
    keyPrefix: key.keyPrefix,
    fullKey: rawKey,
    createdAt: key.createdAt,
    active: key.active,
  });
});

router.delete("/api-keys/:id", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [deleted] = await db.update(apiKeysTable)
    .set({ active: false })
    .where(sql`${apiKeysTable.id} = ${id} AND ${apiKeysTable.userId} = ${clerkId}`)
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "API key not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
