import { Router, type IRouter } from "express";
import { requireAuth, getOrCreateUser } from "../lib/auth";
import { getAuth } from "@clerk/express";

const router: IRouter = Router();

router.get("/user/profile", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId;
  const auth = getAuth(req);

  const user = await getOrCreateUser(
    clerkId,
    (auth as any)?.sessionClaims?.email ?? "",
    (auth as any)?.sessionClaims?.name ?? ""
  );

  res.json(user);
});

export default router;
