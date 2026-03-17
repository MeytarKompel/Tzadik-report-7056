import express, { NextFunction, Request, Response } from "express";
import logic from "../5-logic/logic";

const router = express.Router();

// GET http://localhost:3001/api/_____
router.get("/api/_____", async (request: Request, response: Response, next: NextFunction) => {
    try {
        
    }
    catch (err: any) {
        next(err);
    }
});




export default router;
