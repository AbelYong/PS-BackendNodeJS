import { Request, Response } from "express";
import { db } from "../drizzle/db.js";
import { Carrito, Pedido, ProductoCarrito, ProductoPedido } from "../drizzle/schema.js";
import {
    CerrarCarritoInput,
    QuitarDelCarritoInput,
    CarritoProductoInput,
    ActualizarCarritoInput
} from "../schemas/carrito_schema.js";
import { and, eq } from "drizzle-orm";
import { Cliente } from "../config/roles.js";

type CarritoAuth = {
    email: string | undefined;
    role: string | undefined;
}

type CarritoAuthResult = {
    statusCode: number;
    message: string;
    code: string;
}

export const get = async (req: Request, res: Response) => {
    const auth = {
        email: req.decodedToken?.name,
        role: req.decodedToken?.role
    };

    const authResult = procesarCarritoAuth(auth);

    if (authResult.statusCode !== 200) {
        res.status(authResult.statusCode).json({
            message: authResult.message,
            code: authResult.code
        });
        return;
    }

    const clienteEmail = req.decodedToken?.name as string;

    const cliente = await obtenerUsuario(clienteEmail);

    if (cliente == null) {
        res.status(404).json({
            message: `No se encontró un cliente con el email ${clienteEmail}`,
            code: "CLIENT_NOT_FOUND"
        });
        return;
    }

    const carrito = await db.query.Carrito.findFirst({
        where: { clienteId: cliente.id, cerrado: false }
    });

    if (carrito == null) {
        res.status(404).json({ 
            message: `No se encontró un carrito abierto para el cliente con el email ${clienteEmail}`,
            code: "CART_NOT_FOUND"
        });
        return;
    }

    const productosCarrito = await db.query.ProductoCarrito.findMany({
        where: { carritoId: carrito.id },
        with: {
            producto: true
        }
    });

    res.status(200).json({
        id: carrito.id,
        clienteId: carrito.clienteId,
        productos: productosCarrito.map(pc => ({
            producto: pc.producto,
            cantidad: pc.cantidad
        })),
        actualizadoEn: carrito.updatedAt
    });
}

export const create = async (req: Request, res: Response) => {
    const auth = {
        email: req.decodedToken?.name,
        role: req.decodedToken?.role
    };

    const authResult = procesarCarritoAuth(auth);

    if (authResult.statusCode !== 200) {
        res.status(authResult.statusCode).json({
            message: authResult.message,
            code: authResult.code
        });
        return;
    }

    const clienteEmail = req.decodedToken?.name as string;

    const cliente = await obtenerUsuario(clienteEmail);

    if (cliente == null) {
        res.status(404).json({
            message: `No se encontró un cliente con el email ${clienteEmail}`,
            code: "CLIENT_NOT_FOUND"
        });
        return;
    }

    const carritoAbiertoExistente = await db.query.Carrito.findFirst({
        where: { clienteId: cliente.id, cerrado: false }
    });

    if (carritoAbiertoExistente) {
        res.status(400).json({
            message: `El cliente con el email ${clienteEmail} ya tiene un carrito abierto`,
            code: "OPEN_CART_EXISTS"
        });
        return;
    }

    await db.insert(Carrito).values({
        clienteId: cliente.id,
        cerrado: false
    });

    const newCarrito = await db.query.Carrito.findFirst({
        where: { clienteId: cliente.id, cerrado: false }
    });

    if (newCarrito == null) {
        res.status(500).send();
        return;
    }

    res.status(201).json({
        id: newCarrito.id,
        creadoEn: newCarrito.createdAt
    });
}

export const actualizarProductosCarrito = async (req: Request<CarritoProductoInput, {}, ActualizarCarritoInput>, res: Response) => {
    const auth = {
        email: req.decodedToken?.name,
        role: req.decodedToken?.role
    };

    const authResult = procesarCarritoAuth(auth);

    if (authResult.statusCode !== 200) {
        res.status(authResult.statusCode).json({
            message: authResult.message,
            code: authResult.code
        });
        return;
    }

    const clienteEmail = req.decodedToken?.name as string;

    const cliente = await obtenerUsuario(clienteEmail);

    if (cliente == null) {
        res.status(404).json({
            message: `No se encontró un cliente con el email ${clienteEmail}`,
            code: "CLIENT_NOT_FOUND"
        });
        return;
    }

    const carrito = await obtenerCarritoAbiertoPorId(req.params.carritoId);

    if (carrito == null) {
        res.status(404).json({ 
            message: `No se encontró un carrito abierto para el cliente con el id ${cliente.id}`,
            code: "CART_NOT_FOUND"
        });
        return;
    }

    const productoEnCarrito = await db.query.ProductoCarrito.findFirst({
        where: { carritoId: req.params.carritoId, productoId: req.params.productoId }
    });

    if (productoEnCarrito == null) {
        const result = await db.insert(ProductoCarrito).values({
            carritoId: req.params.carritoId,
            productoId: req.params.productoId,
            cantidad: req.body.cantidad
        });

        if (result[0]?.affectedRows <= 0) {
            res.status(500).send();
            return;
        }

        res.status(201).send();
    } else {
        const result = await db.update(ProductoCarrito).set({ cantidad: req.body.cantidad }).where(
        and(
            eq(ProductoCarrito.carritoId, req.params.carritoId),
            eq(ProductoCarrito.productoId, req.params.productoId)
        )
    );

    if (result[0]?.affectedRows <= 0) {
        res.status(500).send();
        return;
    }

    res.status(204).send();
    }
}

export const quitarDelCarrito = async (req: Request<QuitarDelCarritoInput>, res: Response) => { 
    const auth = {
        email: req.decodedToken?.name,
        role: req.decodedToken?.role
    };

    const authResult = procesarCarritoAuth(auth);

    if (authResult.statusCode !== 200) {
        res.status(authResult.statusCode).json({
            message: authResult.message,
            code: authResult.code
        });
        return;
    }

    const clienteEmail = req.decodedToken?.name as string;
    const cliente = await obtenerUsuario(clienteEmail);

    if (cliente == null) {
        res.status(404).json({
            message: `No se encontró un cliente con el email ${clienteEmail}`,
            code: "CLIENT_NOT_FOUND"
        });
        return;
    }

    const carrito = await obtenerCarritoAbiertoPorId(req.params.carritoId);

    if (carrito == null) {
        res.status(404).json({ 
            message: `No se encontró un carrito abierto para el cliente con el id ${cliente.id}`,
            code: "CART_NOT_FOUND"
        });
        return;
    }

    const result = await db.delete(ProductoCarrito).where(
        and (
            eq(ProductoCarrito.carritoId, carrito.id),
            eq(ProductoCarrito.productoId, req.params.productoId)
        )
    );

    if (result[0]?.affectedRows <= 0) {
        res.status(500).send();
        return;
    }

    res.status(204).send();
}

export const cerrarCarrito = async (req: Request<CerrarCarritoInput>, res: Response) => {
    const auth = {
        email: req.decodedToken?.name,
        role: req.decodedToken?.role
    };

    const authResult = procesarCarritoAuth(auth);

    if (authResult.statusCode !== 200) {
        res.status(authResult.statusCode).json({
            message: authResult.message,
            code: authResult.code
        });
        return;
    }

    const clienteEmail = req.decodedToken?.name as string;
    const cliente = await obtenerUsuario(clienteEmail);

    if (cliente == null) {
        res.status(404).json({
            message: `No se encontró un cliente con el email ${clienteEmail}`,
            code: "CLIENT_NOT_FOUND"
        });
        return;
    }

    const carrito = await obtenerCarritoAbiertoPorId(req.params.carritoId);

    if (carrito == null) {
        res.status(404).json({ 
            message: `No se encontró un carrito abierto para el cliente con el id ${cliente.id}`,
            code: "CART_NOT_FOUND"
        });
        return;
    }

    const affectedRows = await db.transaction(async (tx) => {
        const productosCarrito = await tx.query.ProductoCarrito.findMany({
            where: { carritoId: carrito.id },
            with: {
                producto: true
            }
        });

        const total = () => {
            let sum = 0;
            for (const pc of productosCarrito) {
                if (pc.producto == null) continue;
                sum += pc.cantidad * Number(pc.producto.precio);
            }
            return sum;
        }

        await tx.insert(Pedido).values({
            clienteId: cliente.id,
            carritoId: carrito.id,
            total: total().toFixed(2)
        });

        for (const p of productosCarrito) {
            await tx.insert(ProductoPedido).values({
                pedidoId: p.carritoId,
                productoId: p.productoId,
                precio: p.producto ? p.producto.precio : "0.00",
                cantidad: p.cantidad
             });
        }

        const result = await tx.update(Carrito).set({ cerrado: true }).where(
            and(
                eq(Carrito.id, req.params.carritoId),
                eq(Carrito.clienteId, cliente.id)
            )
        );

        return result[0]?.affectedRows;
    });

    if (affectedRows <= 0) {
        res.status(500).send();
        return;
    }

    res.status(204).send();
}

function procesarCarritoAuth(auth: CarritoAuth): CarritoAuthResult {
    let statusCode;
    let message;
    let code;

    if (auth.email == null) {
        statusCode = 403;
        message = "El JWT no contiene un email de cliente válido";
        code = "FORBIDDEN";
        return { statusCode, message, code };
    }

    if (auth.role !== Cliente) {
        statusCode = 403;
        message = "El rol del token no tiene permisos para realizar esta operación con el carrito";
        code = "FORBIDDEN";
        return { statusCode, message, code };
    }

    return { statusCode: 200, message: "OK", code: "OK" };
}

function obtenerUsuario(email: string) {
    return db.query.Usuario.findFirst({
        where: { email: email },
        columns: {
            id: true,
            email: true,
            nombre: true
        }
    });
}

function obtenerCarritoAbiertoPorId(carritoId: number) {
    return db.query.Carrito.findFirst({
        where: { id: carritoId, cerrado: false }
    });
}
