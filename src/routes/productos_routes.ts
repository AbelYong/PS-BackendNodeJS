import { Router } from "express";
import { authorize } from "../middlewares/authorize.js";
import { asyncHandler } from "../middlewares/async_handler.js";
import { validateParams, validateBody, validateQuery } from "../middlewares/request_validator.js";
import { idSchema } from "../schemas/general_schema.js";
import { Administrador, Autenticado } from "../config/roles.js";
import {
    productoSchema,
    busquedaSchema,
    asignarCategoriaSchema,
    eliminarCategoriaSchema
} from '../schemas/producto_schema.js';
import {
    get,
    getAll,
    create,
    update,
    eliminate,
    asignaCategoria,
    eliminaCategoria
} from "../controllers/productos_controller.js"

const router = Router();

router.get("/", authorize(Autenticado), validateQuery(busquedaSchema), asyncHandler(getAll));

router.get("/:id", authorize(Autenticado), validateParams(idSchema), asyncHandler(get));

router.post("/", authorize(Administrador), validateBody(productoSchema), asyncHandler(create));

router.put("/:id", authorize(Administrador), validateParams(idSchema), validateBody(productoSchema), asyncHandler(update));

router.delete("/:id", authorize(Administrador), validateParams(idSchema), asyncHandler(eliminate));

router.post("/:id/categoria", authorize(Administrador), validateParams(idSchema), validateBody(asignarCategoriaSchema), asyncHandler(asignaCategoria));

router.delete("/:productoId/categoria/:categoriaId", authorize(Administrador), validateParams(eliminarCategoriaSchema), asyncHandler(eliminaCategoria));

export const productosRouter = router;
