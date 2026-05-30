import jwt from "jsonwebtoken"
import { ClaimTypes } from "../config/claimtypes.js"
import { Request } from "express"

const jwtSecret = process.env["JWT_SECRET"] || "";

export const generaToken = (email: string, nombre: string, rol: string) => {
    if (jwtSecret === "") {
        const message = "El secreto JWT no esta cargado en el entorno" 
        console.warn(message);
        throw new Error(message);
    }

    const token = jwt.sign({
        [ClaimTypes.name]: email,
        [ClaimTypes.givenName]: nombre,
        [ClaimTypes.role]: rol,
        "iss": "PS-JWT",
        "aud": "ClientesPS-JWT",
    }, jwtSecret, {
        expiresIn: "20m"
    });

    return token;
}

export const tiempoRestanteToken = (req: Request) : string | null => {
    const decoded = req.decodedToken as jwt.JwtPayload;

    if (!decoded?.exp) {
        return null;
    }

    const time = (decoded.exp - (Date.now() / 1000));
    
     if (time < 0) return "00:00:00"; 

    const minutos = Math.floor(time / 60);
    const segundos = Math.floor(time - minutos * 60);
    
    return `00:${minutos.toString().padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;
}
