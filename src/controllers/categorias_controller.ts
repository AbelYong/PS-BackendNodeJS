import { db } from "../drizzle/db.js"
import { Categoria} from "../drizzle/schema.js"
import { Request, Response } from "express"
import { IdInput } from '../schemas/general_schema.js';
import { CreateCategoriaInput, UpdateCategoriaInput } from "../schemas/categoria_schema.js";
import { eq } from "drizzle-orm";

export const getAll = async (_req: Request, res: Response): Promise<void> => {
    const data =  await db.query.Categoria.findMany({
        columns: {
            id: true,
            nombre: true,
            protegida: true
        }
    });
    res.status(200).json(data);
}

export const get = async (req: Request<IdInput>, res: Response) => {
    const id = req.params.id;

    const data = await db.query.Bitacora.findFirst({
        columns:
        {
            id: true,
            nombre: true,
            protegida: true
        },
        where: { id: id }
    });

    if (data == null) {
        res.status(404).send();
        return;
    }

    res.status(200).json(data);
}

export const create = async (req: Request<{}, {}, CreateCategoriaInput>, res: Response) => {
    const nombre = req.body.nombre;

    const data = await db.insert(Categoria).values({
        nombre: nombre
    }).$returningId();

    const newId = data[0]?.id;

    if (newId) {
        req.bitacora("categoria.crear", newId);
    }

    const nuevaCategoria = await db.query.Categoria.findFirst({
        columns:
        {
            id: true,
            nombre: true,
            protegida: true
        },
        where: { id: newId }
    });

    res.status(201).json(nuevaCategoria)
}

export const update = async (req: Request<IdInput, {}, UpdateCategoriaInput>, res: Response) => {
    const id = req.params.id;
    const nombre = req.body.nombre;

    await db.update(Categoria).set({
        nombre: nombre,
    }).where(eq(Categoria.id, id));

    req.bitacora("categoria.editar", id);
    res.status(204).send();
}

export const eliminate = async (req: Request<IdInput>, res: Response) => {
    const id = req.params.id;

    const data = await db.query.Categoria.findFirst({
        columns:
        {
            id: true,
            nombre: true,
            protegida: true
        },
        where: { id: id }
    });

    if (!data) {
        res.status(404).send();
        return;
    }

    if (data.protegida) {
        res.status(400).json({message: "No se pueden eliminar categorias protegidas"});
        return;
    }

    const removed = await db.delete(Categoria).where(eq(Categoria.id, id));

    if (removed[0].affectedRows > 0) {
        req.bitacora("categoria.eliminar", id);
        res.status(204).json(data);
    } else {
        res.status(404).send();
    }
}
