import jwt from "jsonwebtoken"
import { ClaimTypes } from "../config/claimtypes.js"
import { generaToken } from "../services/jwt_token.js"
import { Request, Response, NextFunction } from "express"

const jwtSecret = process.env["JWT_SECRET"] || "";

export const authorize = (rol: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const error = new Error("Acceso denegado") as any;
        error.statusCode = 401;
        try {
            if (jwtSecret === "") {
                const message = "El secreto JWT no está cargado en el entorno" 
                console.warn(message);
                throw new Error(message);
            }

            const authHeader = req.header("Authorization");

            if (authHeader == null) {
                error.statusCode = 400;
                error.message = "La cabecera Authorization no está presente";
                return next(error);
            }
            
            if (!authHeader.startsWith("Bearer")) {
                return next(error);
            }

            const token = authHeader.split(" ")[1];

            if (token == null) {
                return next(error);
            }

            const decodedToken = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
            
            const exp = decodedToken.exp;
            if (exp == null) {
                return next(error);
            }

            if (!rol.split(",").includes(decodedToken[ClaimTypes.role])) {
                return next(error);
            }

            req.decodedToken = {
                name: decodedToken[ClaimTypes.name],
                givenName: decodedToken[ClaimTypes.givenName],
                role: decodedToken[ClaimTypes.role]
            };

            const minutosRestantes = (exp - (Date.now() / 1000)) / 60;

            if (minutosRestantes < 5) {
                const nuevoToken = generaToken(
                    decodedToken[ClaimTypes.name], 
                    decodedToken[ClaimTypes.givenName], 
                    decodedToken[ClaimTypes.role]
                );
                res.header("Set-Authorization", nuevoToken);
            }
            
            next();
        } catch (error) {
            next(error);
        }
    }
}
