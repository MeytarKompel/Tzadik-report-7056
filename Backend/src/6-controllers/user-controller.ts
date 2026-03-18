import express, { Request, Response, NextFunction } from "express";
import userLogic from "../5-logic/user-logic";

const router = express.Router();

// GET ALL USERS
router.get("/users", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userLogic.getAllUsers();
        res.json(users);
    } catch (err) {
        next(err);
    }
});

// GET USERS BY UNIT
router.get("/users/by-unit/:unit", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userLogic.getUsersByUnit(req.params.unit);
        res.json(users);
    } catch (err) {
        next(err);
    }
});

// GET USERS BY ROLE
router.get("/users/by-role/:role", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userLogic.getUsersByRole(req.params.role);
        res.json(users);
    } catch (err) {
        next(err);
    }
});

// IDENTIFY USER FOR REPORT
router.post("/users/identify", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { personalNumber, phone } = req.body;

        const user = await userLogic.identifyUserForReport(personalNumber, phone);

        if (!user) {
            return res.status(404).json({ message: "User not found or identification failed" });
        }

        res.json(user);
    } catch (err) {
        next(err);
    }
});

// GET USER BY PERSONAL NUMBER
router.get("/users/:personalNumber", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userLogic.getUserByPersonalNumber(req.params.personalNumber);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (err) {
        next(err);
    }
});

// CREATE USER
router.post("/users", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userLogic.addUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
});

// UPDATE USER
router.put("/users/:personalNumber", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedUser = await userLogic.updateUser(
            req.params.personalNumber,
            req.body
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(updatedUser);
    } catch (err) {
        next(err);
    }
});

// DELETE USER
router.delete("/users/:personalNumber", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deletedUser = await userLogic.deleteUser(req.params.personalNumber);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted", deletedUser });
    } catch (err) {
        next(err);
    }
});

export default router;