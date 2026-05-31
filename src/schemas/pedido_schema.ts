import { z } from "zod";

export const EstadoPedido = z.enum(
    [
        "pendiente",
        "aprobado",
        "enviado",
        "entregado",
        "cancelado"
    ]
);

export const updateEstadoPedidoSchema = z.object({
    estado: EstadoPedido
});

export type UpdateEstadoPedidoInput = z.infer<typeof updateEstadoPedidoSchema>;
