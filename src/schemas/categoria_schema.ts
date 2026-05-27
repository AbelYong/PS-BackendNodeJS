import { z } from "zod";

export const createCategoriaSchema = z.object({
    nombre: z.string().max(255)
});

export type CreateCategoriaInput = z.infer<typeof createCategoriaSchema>

export const updateCategoriaSchema = z.object({
    nombre: z.string().max(255)
});

export type UpdateCategoriaInput = z.infer<typeof updateCategoriaSchema>