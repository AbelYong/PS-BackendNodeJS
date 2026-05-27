import { Request, Response } from "express";
import { db } from "../drizzle/db.js";


export const getAll = async (_req: Request, res: Response) : Promise<void> => {
    const data = await db.query.Bitacora.findMany({
        columns: {
            id: true,
            accion: true,
            elementoId: true,
            ip: true,
            usuario: true,
            fecha: true
        },
        orderBy: { id: "desc" }
    });

    res.status(200).json(data);
}
