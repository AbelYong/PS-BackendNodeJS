import { Request, Response } from "express"
import bcrypt from "bcrypt"
import { db } from "../drizzle/db.js"
import { Usuario } from "../drizzle/schema.js"
import { ClienteInput, EmailInput, UsuarioInput } from "../schemas/usuario_schema.js"
import { eq } from "drizzle-orm"
import { Cliente as ClienteRol } from "../config/roles.js"

export const getAll = async (_req: Request, res: Response): Promise<void> => {
    const data = await db.query.Usuario.findMany({
        columns: {
            id: true,
            email: true,
            nombre: true,
        },
        with: {
            rol: {
                columns: {
                    nombre: true
                }
            }
        }
    });

    res.status(200).json([
        ...data.map(user => ({
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            rol: user.rol?.nombre
        }))
    ]);
}

export const get = async (req: Request<EmailInput>, res: Response) => {
    const email = req.params.email;

    const data = await db.query.Usuario.findFirst({
        columns: {
            id: true,
            email: true,
            nombre: true,
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

    if (data == null) {
        res.status(404).send();
        return;
    }

    res.status(200).json({
        id: data.id,
        email: data.email,
        nombre: data.nombre,
        rol: data.rol?.nombre
    });
}

export const create = async (req: Request<{}, {}, UsuarioInput>, res: Response) => {
    const rolUsuario = await db.query.Rol.findFirst({
        where: { nombre: req.body.rol }
    });

    if (rolUsuario == null) {
        res.status(404).send();
        return;
    }

    const data = await db.insert(Usuario).values({
        email: req.body.email,
        passwordHash: await bcrypt.hash(req.body.password, 10),
        nombre: req.body.nombre,
        rolId: rolUsuario.id  
    }).$returningId();

    const newUser = await db.query.Usuario.findFirst({
        columns: {
            id: true,
            email: true,
            nombre: true,
        },
        with: {
            rol: {
                columns: {
                    nombre: true
                }
            }
        },
        where: { id: data[0]?.id }
    });

    if (newUser == null) {
        res.status(500).send();
        return;
    }

    await req.bitacora("usuarios.crear", newUser.id);
    res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        nombre: newUser.nombre,
        rol: newUser.rol?.nombre
    });
}

export const update = async (req: Request<EmailInput, {}, UsuarioInput>, res: Response) => {
    const email = req.params.email;
    const rol = await db.query.Rol.findFirst({
        where: { nombre: req.body.rol }
    });

    if (rol == null) {
        res.status(404).send();
        return;
    }

    const usuarioExistente = await db.query.Usuario.findFirst({
        where: { email: email }
    });

    if (usuarioExistente == null) {
        res.status(404).send();
        return;
    }

    await db.update(Usuario).set({
        email: req.body.email,
        nombre: req.body.nombre,
        passwordHash: await bcrypt.hash(req.body.password, 10),
        rolId: rol.id,
        updatedAt: new Date() 
    }).where(eq(Usuario.id, usuarioExistente.id));;

    await req.bitacora("usuarios.editar", usuarioExistente.id);
    res.status(204).send();
}

export const eliminate = async (req: Request<EmailInput>, res: Response) => {
    const email = req.params.email;

    const usuarioExistente = await db.query.Usuario.findFirst({
        where: { email: email }
    });

    if (usuarioExistente == null) {
        res.status(404).send();
        return;
    }

    if (usuarioExistente.protegido) {
        res.status(403).json({message: "No se pueden eliminar usuarios protegidos"});
        return;
    }

    const resultado = await db.delete(Usuario).where(
        eq(Usuario.email, email)
    );

    if (resultado[0]?.affectedRows <= 0) {
        res.status(500).send();
        return;
    }

    await req.bitacora("usuarios.eliminar", usuarioExistente.id);
    res.status(204).send();
}

export const registrarCliente = async (req: Request<{}, {}, ClienteInput>, res: Response) => {
    const nombreRolCliente = ClienteRol;
    
    const rolCliente = await db.query.Rol.findFirst({
        where: { nombre: nombreRolCliente }
    });

    if (rolCliente == null) {
        res.status(404).send();
        console.warn(`No se encontró el rol de ${nombreRolCliente} en la base de datos`);
        return;
    }

    const data = await db.insert(Usuario).values({
        email: req.body.email,
        passwordHash: await bcrypt.hash(req.body.password, 10),
        nombre: req.body.nombre,
        rolId: rolCliente.id  
    }).$returningId();

    const newUser = await db.query.Usuario.findFirst({
        columns: {
            id: true,
            email: true,
            nombre: true,
        },
        with: {
            rol: {
                columns: {
                    nombre: true
                }
            }
        },
        where: { id: data[0]?.id }
    });

    if (newUser == null) {
        res.status(500).send();
        return;
    }

    await req.bitacora("usuarios.registrarCliente", newUser.id);
    res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        nombre: newUser.nombre,
        rol: newUser.rol?.nombre
    });
}
