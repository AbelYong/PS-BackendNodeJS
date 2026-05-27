import { Request, Response } from "express"
import bcrypt from "bcrypt"
import { db } from "../drizzle/db.js"
import { generaToken, tiempoRestanteToken } from "../services/jwt_token.js"
import { LoginInput } from "../schemas/auth_schema.js"


export const login = async (req: Request<{}, {}, LoginInput>, res: Response) : Promise<void> => {
    const email = req.body.email;
    const password = req.body.password;

    const usuario = await db.query.Usuario.findFirst({
        columns: {
            id: true,
            email: true,
            nombre: true,
            passwordHash: true
        },
        with: {
            rol: {
                columns: {
                    nombre: true
                }
            }
        },
        where: { email: email }
    });

    if (usuario == null) {
        res.status(401).json({code: "UNAUTHORIZED", message: "Email o contraseña incorrectos"});
        return;
    }

    const passwordMatch = await bcrypt.compare(password, usuario.passwordHash);

    if (!passwordMatch) {
        res.status(401).json({code: "UNAUTHORIZED", message: "Email o contraseña incorrectos"});
        return;
    }

    if (usuario.rol == null) {
        res.status(500).send();
        console.warn(`user: ${usuario.id} has no assigned role`);
        return;
    }

    const token = generaToken(usuario.email, usuario.nombre, usuario.rol.nombre);

    res.status(200).json({
        email: usuario.email,
        nombre: usuario.nombre,
        rol:usuario.rol.nombre,
        jwt: token
    });
}

export const tiempo = async (req: Request, res: Response) : Promise<void> => {
    const tiempo = tiempoRestanteToken(req);

    if (tiempo == null) {
        res.status(404).send();
        return;
    }
    res.status(200).json({ tiempo: tiempo });
}
