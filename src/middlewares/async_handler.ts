import { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler = <
    P = any,
    ResBody = any,
    ReqBody = any,
    ReqQuery = any,
    Locals extends Record<string, any> = Record<string, any>
>(
    fn: (
        req: Request<P, ResBody, ReqBody, ReqQuery, Locals>, 
        res: Response<ResBody, Locals>, 
        next: NextFunction
    ) => Promise<any>
): RequestHandler<any, ResBody, ReqBody, ReqQuery, Locals> => {
    return (req, res, next) => {
        Promise.resolve(fn(req as any, res, next)).catch(next);
    };
};