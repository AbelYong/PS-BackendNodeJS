import { Router } from "express";
import { authorize } from "../middlewares/authorize.js";
import { asyncHandler } from "../middlewares/async_handler.js";
import { validateParams, validateBody } from "../middlewares/request_validator.js";
import { Administrador } from "../config/roles.js";
import {
    emailSchema,
    usuarioSchema
} from "../schemas/usuario_schema.js"
import {
    get,
    getAll,
    create,
    update,
    eliminate
} from "../controllers/usuarios_controller.js"

const router = Router();

router.get("/", authorize(Administrador), asyncHandler(getAll));

router.get("/:email", authorize(Administrador), asyncHandler(get));

router.post("/", authorize(Administrador), validateBody(usuarioSchema), asyncHandler(create));

router.put("/:email", authorize(Administrador), validateParams(emailSchema), validateBody(usuarioSchema), asyncHandler(update));

router.delete("/:email", authorize(Administrador), validateParams(emailSchema), asyncHandler(eliminate));

export const usuariosRouter = router;
