import { ClaimTypes } from "../config/claimtypes.js"

declare global {
    namespace Express {
        interface Request {
            decodedToken?: typeof ClaimTypes,
            bitacora: any 
        }
    }
}