import { Router } from "express";
import { authorize } from "../middlewares/authorize.js";
import { asyncHandler } from "../middlewares/async_handler.js";
import { validateParams, validateBody } from "../middlewares/request_validator.js";
import { idSchema } from "../schemas/general_schema.js";
import { Administrador, Autenticado } from "../config/roles.js";
import { createCategoriaSchema, updateCategoriaSchema } from "../schemas/categoria_schema.js";
import { 
    getAll,
    get,
    create,
    update,
    eliminate
} from "../controllers/categorias_controller.js";

const router = Router();

router.get("/", authorize(Autenticado), asyncHandler(getAll));

router.get("/:id", authorize(Autenticado), validateParams(idSchema), asyncHandler(get));

router.post("/", authorize(Administrador), validateBody(createCategoriaSchema), asyncHandler(create));

router.put("/:id", authorize(Administrador), validateParams(idSchema), validateBody(updateCategoriaSchema), asyncHandler(update));

router.delete("/:id", authorize(Autenticado), validateParams(idSchema), asyncHandler(eliminate));

export const categoriasRouter = router;
