import { NextFunction, Request, Response } from "express";
import ClientError from "../2-utils/client-error";

function routeNotFound(request: Request, response: Response, next: NextFunction): void {
    next(new ClientError(404, `Route not found: ${request.originalUrl}`));
}

export default routeNotFound;