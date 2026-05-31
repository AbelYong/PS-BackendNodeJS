import { Router } from 'express';
import { authorize } from '../middlewares/authorize.js';
import { asyncHandler } from '../middlewares/async_handler.js';
import { validateParams, validateBody } from '../middlewares/request_validator.js';
import { Cliente, Administrador } from '../config/roles.js';
import { idSchema } from "../schemas/general_schema.js";
import { updateEstadoPedidoSchema } from '../schemas/pedido_schema.js';
import {
    getAll,
    getAllDelCliente,
    getDetalle,
    update
} from '../controllers/pedido_controller.js';

const router = Router();

router.get("/", authorize(Administrador), asyncHandler(getAll));

router.get("/clientes/:id", authorize(Cliente), validateParams(idSchema), asyncHandler(getAllDelCliente));

router.get("/:id/detalles", authorize(Administrador), validateParams(idSchema), asyncHandler(getDetalle));

router.get("/clientes/:id/detalles", authorize(Cliente), validateParams(idSchema), asyncHandler(getDetalle));

router.patch("/:id/estado", authorize(Administrador), validateParams(idSchema), validateBody(updateEstadoPedidoSchema), asyncHandler(update));

export const pedidoRouter = router;
