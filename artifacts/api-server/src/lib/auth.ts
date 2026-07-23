import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const auth = getAuth(req);
  const clerkId = auth?.userId;
  if (!clerkId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as any).clerkId = clerkId;
  next();
};

// Get or create local user record from Clerk ID
export async function getOrCreateUser(clerkId: string, email = "", name = "") {
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));
  if (existing) return existing;
  const [created] = await db.insert(usersTable).values({ clerkId, email, name, plan: "free" }).returning();
  return created;
}
