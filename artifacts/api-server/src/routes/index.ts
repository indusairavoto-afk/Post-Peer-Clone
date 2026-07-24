import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import postsRouter from "./posts";
import platformsRouter from "./platforms";
import apiKeysRouter from "./apikeys";
import userRouter from "./user";
import oauthRouter from "./oauth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(postsRouter);
router.use(platformsRouter);
router.use(apiKeysRouter);
router.use(userRouter);
router.use(oauthRouter);

export default router;
