import { Router } from "express";
import { authorize } from "../middlewares/authorize.js";
import { asyncHandler } from "../middlewares/async_handler.js";
import { Administrador } from "../config/roles.js";
import {
    getAll
} from "../controllers/rol_controller.js"

const router = Router();

router.get("/", authorize(Administrador), asyncHandler(getAll))

export const rolesRouter = router;
