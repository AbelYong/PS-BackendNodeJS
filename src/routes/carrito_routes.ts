import { Router } from 'express';
import { authorize } from '../middlewares/authorize.js';
import { asyncHandler } from '../middlewares/async_handler.js';
import { validateParams, validateBody } from '../middlewares/request_validator.js';
import { Cliente } from '../config/roles.js';
import {
    actualizarCarritoSchema,
    quitarDelCarritoSchema,
    cerrarCarritoSchema,
    carritoClienteShema
} from "../schemas/carrito_schema.js";
import {
    get,
    create,
    actualizarProductosCarrito,
    quitarDelCarrito,
    cerrarCarrito
} from '../controllers/carrito_controller.js';

const router = Router();

router.get("/", authorize(Cliente), asyncHandler(get));

router.post("/", authorize(Cliente), asyncHandler(create));

router.put("/:carritoId/producto/:productoId",
    authorize(Cliente),
    validateParams(carritoClienteShema), validateBody(actualizarCarritoSchema),
    asyncHandler(actualizarProductosCarrito)
);

router.delete("/:carritoId/producto/:productoId",
    authorize(Cliente),
    validateParams(quitarDelCarritoSchema), asyncHandler(quitarDelCarrito)
);

router.post("/:carritoId/checkout",
    authorize(Cliente),
    validateParams(cerrarCarritoSchema), asyncHandler(cerrarCarrito)
);

export const carritoRouter = router;
