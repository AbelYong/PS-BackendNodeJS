import { z } from "zod"

export const emailSchema = z.object({
    email: z.email().max(255)
});

export type EmailInput = z.infer<typeof emailSchema>

export const usuarioSchema = z.object({
    email: z.email().max(255),
    password: z.string()
        .min(8, { error: "La contraseña debe tener al menos ocho caracteres." })
        .regex(/[A-Z]/, { error: "La contraseña debe tener al menos una letra mayúscula." })
        .regex(/[a-z]/, { error: "La contraseña debe tener al menos una letra minúscula." })
        .regex(/\d/, { error: "La contraseña debe tener al menos un dígito." })
        .regex(/[^A-Za-z0-9]/, { error: "La contraseña debe tener al menos un símbolo." }),
    nombre: z.string().max(255),
    rol: z.string().max(255),
});

export type UsuarioInput = z.infer<typeof usuarioSchema>

export const clienteSchema = z.object({
    email: z.email().max(255),
    password: z.string()
        .min(8, { error: "La contraseña debe tener al menos ocho caracteres." })
        .regex(/[A-Z]/, { error: "La contraseña debe tener al menos una letra mayúscula." })
        .regex(/[a-z]/, { error: "La contraseña debe tener al menos una letra minúscula." })
        .regex(/\d/, { error: "La contraseña debe tener al menos un dígito." })
        .regex(/[^A-Za-z0-9]/, { error: "La contraseña debe tener al menos un símbolo." }),
    nombre: z.string().max(255)
});

export type ClienteInput = z.infer<typeof clienteSchema>
