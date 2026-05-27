import { Router } from "express";
import { authorize } from "../middlewares/authorize.js";
import { asyncHandler } from "../middlewares/async_handler.js";
import {
    login,
    tiempo
} from "../controllers/auth_controller.js"
import { Autenticado } from "../config/roles.js";

const router = Router();

router.post("/", asyncHandler(login));

router.get("/tiempo", authorize(Autenticado), asyncHandler(tiempo));

export const authRouter = router;
