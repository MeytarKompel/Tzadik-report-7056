import { Request, Response, NextFunction } from "express";
import ClientError from "../2-utils/client-error";

class ErrorsMiddleware {
    public catchAll(err: any, req: Request, res: Response, next: NextFunction): void {
        console.error(err);

        if (err instanceof ClientError) {
            res.status(err.status).json({ message: err.message });
            return;
        }

        if (err?.name === "ValidationError") {
            const messages = Object.values(err.errors).map((e: any) => e.message);
            res.status(400).json({ message: messages.join(", ") });
            return;
        }

        if (err?.code === 11000) {
            res.status(400).json({ message: "Duplicate value error" });
            return;
        }

        res.status(500).json({ message: "Internal server error" });
    }
}

const errorsMiddleware = new ErrorsMiddleware();
export default errorsMiddleware;