import requestIp from "request-ip"
import { Request, Response, NextFunction } from "express"
import { db } from "../drizzle/db.js"
import { Bitacora } from "../drizzle/schema.js";

export const bitacoraLogger = (req: Request, _res: Response, next: NextFunction) => {
    const ip = requestIp.getClientIp(req);

    req.bitacora = async (accion: string, id: number) => {
        let email = "invitado";

        if (req.decodedToken) {
            email = req.decodedToken.name || "invitado";
        }

        try {
            await db.insert(Bitacora).values({
                accion: accion,
                elementoId: id,
                ip: ip || "0.0.0.0",
                usuario: email,
                fecha: new Date()
            });
        } catch (err) {
            console.error(`No se pudo guardar en bitacora: ${err}`);
        }
    }
    next();
}