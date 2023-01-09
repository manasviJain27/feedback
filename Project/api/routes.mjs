import { Router } from "express";
import authRoutes from "./feedback/routes.mjs";
const router = new Router();

authRoutes(router);

export default router;
