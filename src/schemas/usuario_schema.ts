import { z } from "zod"

export const emailSchema = z.object({
    email: z.email().max(255)
});

export type EmailInput = z.infer<typeof emailSchema>

export const usuarioSchema = z.object({
    email: z.email().max(255),
    password: z.string()
        .min(8, { error: "Password must have at least eight characters." })
        .regex(/[A-Z]/, { error: "Password must have at least one uppercase letter." })
        .regex(/[a-z]/, { error: "Password must have at least one lowercase letter." })
        .regex(/\d/, { error: "Password must have at least one digit." })
        .regex(/[^A-Za-z0-9]/, { error: "Password must have at least one symbol." }),
    nombre: z.string().max(255),
    rol: z.string().max(255),
});

export type UsuarioInput = z.infer<typeof usuarioSchema>
