import { z } from "zod"

export const productoSchema = z.object({
    titulo: z.string({error: "El titulo es obligatorio"}).max(255),
    descripcion: z.string({error: "La descripcion es obligatoria"}).max(255),
    precio: z.coerce.number({error: "El precio es obligatorio"}).min(1).max(10000000),
    archivoId: z.coerce.number().int().optional().nullable()
})

export type ProductoInput = z.infer<typeof productoSchema>

export const busquedaSchema = z.object({
    titulo: z.string().max(255)
    .transform((val) => {
            const espacioLimpio = val.replaceAll('+', ' ');
            return espacioLimpio.trim();
        })
})

export type BusquedaInput = z.infer<typeof busquedaSchema>

export const asignarCategoriaSchema = z.object({
    categoriaId: z.int()
})

export type AsignaCategoriaInput = z.infer<typeof asignarCategoriaSchema>

export const eliminarCategoriaSchema = z.object({
    productoId: z.int(),
    categoriaId: z.int()
})

export type EliminarCategoriaInput = z.infer<typeof eliminarCategoriaSchema>
