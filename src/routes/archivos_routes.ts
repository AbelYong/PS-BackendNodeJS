import { Router } from "express";
import { authorize } from "../middlewares/authorize.js";
import { asyncHandler } from "../middlewares/async_handler.js";
import { validateParams } from "../middlewares/request_validator.js";
import { idSchema } from "../schemas/general_schema.js";
import { Administrador, AdministradorCliente } from "../config/roles.js";
import { uploadFile } from "../middlewares/upload.js";
import {
    get,
    getAll,
    getDetalle,
    create,
    update,
    eliminate
} from "../controllers/archivos_controller.js"

const router = Router();

router.get("/", authorize(AdministradorCliente), asyncHandler(getAll));

router.get("/:id", authorize(AdministradorCliente), validateParams(idSchema), asyncHandler(get));

router.get("/:id/detalle", authorize(AdministradorCliente), validateParams(idSchema), asyncHandler(getDetalle));

router.post("/", authorize(Administrador), uploadFile.single("file"), asyncHandler(create));

router.put("/:id", authorize(Administrador), validateParams(idSchema), uploadFile.single("file"), asyncHandler(update));

router.delete("/:id", authorize(Administrador), validateParams(idSchema), asyncHandler(eliminate));

export const archivosRouter = router;
