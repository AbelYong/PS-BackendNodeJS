import { Request, Response } from "express";
import { db } from "../drizzle/db.js";
import { Pedido } from "../drizzle/schema.js";
import { IdInput } from "../schemas/general_schema.js";
import { UpdateEstadoPedidoInput } from "../schemas/pedido_schema.js";
import { eq } from "drizzle-orm";
import { Administrador, Cliente } from "../config/roles.js";

export const getAll = async (_req: Request, res: Response) => {
    const pedidos = await db.query.Pedido.findMany({
        columns: {
            id: true,
            total: true,
            estado: true,
            createdAt: true,
            updatedAt: true   
        },
        with: {
            cliente: {
                columns: {
                    id: true,
                    nombre: true,
                    email: true
                }
            }
        }
    });

    res.status(200).json(pedidos);
}

export const getAllDelCliente = async (req: Request<IdInput>, res: Response) => {
    const clienteEmail = req.decodedToken?.name;

    const cliente = await db.query.Usuario.findFirst({
        where: { email: clienteEmail }
    });

    if (cliente == null) {
        res.status(404).json({ message: "Cliente no encontrado" });
        return;
    }
    
    const pedido = await db.query.Pedido.findMany({
        columns: {
            id: true,
            total: true,
            estado: true,
            createdAt: true,
            updatedAt: true  
        },
        where: {
            clienteId: cliente.id
        }
    });

    if (pedido.length === 0) {
        res.status(404).json({ message: "No se encontraron pedidos para este cliente" });
        return;
    }

    res.status(200).json(pedido);
}

export const getDetalle = async (req: Request<IdInput>, res: Response) => {
    const esAdmin = req.decodedToken?.role === Administrador;
    const esCliente = req.decodedToken?.role === Cliente;

    let pedidoPerteneAlCliente: boolean = false;
    if (esCliente) {
        const usuario = await db.query.Usuario.findFirst({
            where: { email: req.decodedToken?.name }
        });

        const pedido = await db.query.Pedido.findFirst({
            where: { id: req.params.id }
        });

        if (usuario != null && pedido != null) {
            pedidoPerteneAlCliente = usuario.id === pedido.clienteId;
        }
    }

    const tieneAcceso = esAdmin || pedidoPerteneAlCliente;

    if (!tieneAcceso) {
        res.status(403).json({
            message: "No puede acceder a este contenido. Verifique el Id del pedido" 
        });
        return;
    }
    
    const productosPedidos = await db.query.ProductoPedido.findMany({
        columns: {
            pedidoId: true,
            productoId: true,
            precio: true,
            cantidad: true
        },
        with: {
            pedido: true,
            producto: true
        },
        where: {
            pedidoId: req.params.id
        }
    });

    if (productosPedidos.length === 0) {
        res.status(404).json({
            message: "No se encontraron productos para este pedido, es posible que el Id no corresponda a un pedido existente"
        });
        return;
    }

    res.status(200).json({
        pedidoId: productosPedidos[0]?.pedidoId,
        productos: productosPedidos.map(pp => ({
            id: pp.productoId,
            titulo: pp.producto?.titulo,
            precioVenta: pp.precio,
            cantidad: pp.cantidad,
            archivoId: pp.producto?.archivoId
        })),
        total: productosPedidos[0]?.pedido?.total,
        estado: productosPedidos[0]?.pedido?.estado,
        updatedAt: productosPedidos[0]?.pedido?.updatedAt
    });
}

export const update = async (req: Request<IdInput, {}, UpdateEstadoPedidoInput>, res: Response) => {
    const pedidoExistente = await db.query.Pedido.findFirst({
        where: {
            id: req.params.id
        }
    });

    if (!pedidoExistente) {
        res.status(404).json({ message: "Pedido no encontrado" });
        return;
    }

    const evaluacionTransicion = validarTransicionPedido(pedidoExistente.estado, req.body.estado);

    if (evaluacionTransicion.statusCode !== 200) {
        res.status(evaluacionTransicion.statusCode).json({message: evaluacionTransicion.message});
        return;
    }

    const pedidoActualizado = await db.update(Pedido)
    .set({
        estado: req.body.estado,
        updatedAt: new Date()
    })
    .where(eq(Pedido.id, req.params.id));

    if (pedidoActualizado[0].affectedRows === 0) {
        res.status(500).json({ message: "Error al actualizar el pedido" });
        return;
    }

    res.status(204).send();
}

type ResultadoTransicion = {
    statusCode: number;
    message: string
}

function validarTransicionPedido(estadoActual: string, nuevoEstado: string) : ResultadoTransicion {
    if (estadoActual === "entregado" || estadoActual === "cancelado") {
        return {
            statusCode: 422,
            message: `Un pedido con estado ${estadoActual} no puede ser actualizado`
        }
    }

    if (nuevoEstado === "cancelado") {
        return {
            statusCode: 200,
            message: "OK"
        }
    }
    
    if (estadoActual === "pendiente" && nuevoEstado !== "aprobado") {
        return {
            statusCode: 422,
            message: "Un pedido en estado pendiente solo puede ser aprobado o cancelado"
        }
    }

    if (estadoActual === "aprobado" && nuevoEstado !== "enviado") {
        return {
            statusCode: 422,
            message: "Un pedido en estado aprobado solo puede ser enviado o cancelado"
        }
    }

    if (estadoActual === "enviado" && nuevoEstado !== "entregado") {
        return {
            statusCode: 422,
            message: "Un pedido en estado enviado solo puede ser entregado o cancelado"
        }
    }

    return { statusCode: 200, message: "OK" }
}
