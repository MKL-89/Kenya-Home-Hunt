import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import housesRouter from "./houses";
import favoritesRouter from "./favorites";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(housesRouter);
router.use(favoritesRouter);
router.use(statsRouter);

export default router;
