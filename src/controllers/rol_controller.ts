import { Request, Response } from "express"
import { db } from "../drizzle/db.js"

export const getAll = async (_req: Request, res: Response) : Promise<void> => {
    const roles = await db.query.Rol.findMany({
        columns: {
            id: true,
            nombre: true
        }
    });

    res.status(200).json(roles);
}
