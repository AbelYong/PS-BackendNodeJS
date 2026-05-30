import fs from "node:fs"
import requestIp from "request-ip"
import { Request, Response, NextFunction } from "express"

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
    let mensaje = "No se ha podido procesar la petición. Intentelo nuevamente más tarde"
    const statusCode = err.statusCode || 500;
    const ip = requestIp.getClientIp(req);

    let email = "Anonimo";
    if ( req.decodedToken ) {
        email = req.decodedToken.name;
    }

    fs.appendFile("logs/log.txt", `${new Date()} - ${statusCode} - ${ip} - ${email} - ${err.message || mensaje}\n`, err => {
        if (err) {
            console.error(err);
        }
    });

    if (errorCodes.has(err.code)) {
        res.status(503).json({
            error: "Service unavaible",
            message: "A downstream service or database is currently unavaible. Please try again later"
        });
        return;
    }

    if (err.message === "jwt expired") {
        res.status(401).json({
            error: "Unauthorized",
            message: "El token ha expirado. Por favor, inicie sesión nuevamente"
        });
        return;
    }

    if (process.env["NODE_ENV"] === "development") {
        mensaje = err.message || mensaje;
        res.status(statusCode).json({
            status: statusCode,
            mensaje: mensaje,
            stack: err.stack
        });
    } else {
        res.status(statusCode).send({ mensaje: mensaje });
    }
}

const errorCodes: Set<string> = new Set([
    "ECONNREFUSED",
    "1045",
    "2006",
    "1040",
    "2013"
]);
