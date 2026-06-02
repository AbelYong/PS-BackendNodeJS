import { z } from "zod";

const maxInteger = 2147483647;

export const idSchema = z.object({
    id: z.coerce.number().int().positive().max(maxInteger)
});

export type IdInput = z.infer<typeof idSchema>;
