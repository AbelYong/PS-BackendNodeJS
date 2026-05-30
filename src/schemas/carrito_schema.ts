import { z } from "zod"

export const carritoProductoSchema = z.object({
    carritoId: z.coerce.number().int().positive(),
    productoId: z.coerce.number().int().positive()
});

export type CarritoProductoInput = z.infer<typeof carritoProductoSchema>;

export const carritoClienteShema = z.object({
    carritoId: z.coerce.number().int().positive(),
    productoId: z.coerce.number().int().positive()
});

export type CarritoClienteInput = z.infer<typeof carritoClienteShema>;

export const actualizarCarritoSchema = z.object({
    cantidad: z.coerce.number().int().positive().max(999)
});

export type ActualizarCarritoInput = z.infer<typeof actualizarCarritoSchema>;

export const quitarDelCarritoSchema = z.object({
    carritoId: z.coerce.number().int().positive(),
    productoId: z.coerce.number().int().positive()
});

export type QuitarDelCarritoInput = z.infer<typeof quitarDelCarritoSchema>;

export const cerrarCarritoSchema = z.object({
    carritoId: z.coerce.number().int().positive()
});

export type CerrarCarritoInput = z.infer<typeof cerrarCarritoSchema>;
