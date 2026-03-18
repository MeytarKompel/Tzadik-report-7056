import express, { Request, Response, NextFunction } from "express";
import deviceLogic from "../5-logic/device-logic";

const router = express.Router();

// GET ALL
router.get("/devices", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const devices = await deviceLogic.getAllDevices();
        res.json(devices);
    } catch (err) {
        next(err);
    }
});

// GET BY NUMBER
router.get("/devices/by-number/:deviceNumber", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const device = await deviceLogic.getDeviceByNumber(req.params.deviceNumber);

        if (!device) {
            return res.status(404).json({ message: "Device not found" });
        }

        res.json(device);
    } catch (err) {
        next(err);
    }
});

// GET BY NAME
router.get("/devices/by-name/:deviceName", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const devices = await deviceLogic.getDevicesByName(req.params.deviceName);
        res.json(devices);
    } catch (err) {
        next(err);
    }
});

// CREATE
router.post("/devices", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const device = await deviceLogic.addDevice(req.body);
        res.status(201).json(device);
    } catch (err) {
        next(err);
    }
});

// UPDATE BY NUMBER
router.put("/devices/by-number/:deviceNumber", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updated = await deviceLogic.updateDeviceByNumber(
            req.params.deviceNumber,
            req.body
        );

        if (!updated) {
            return res.status(404).json({ message: "Device not found" });
        }

        res.json(updated);
    } catch (err) {
        next(err);
    }
});

// DELETE BY NUMBER
router.delete("/devices/by-number/:deviceNumber", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deleted = await deviceLogic.deleteDeviceByNumber(req.params.deviceNumber);

        if (!deleted) {
            return res.status(404).json({ message: "Device not found" });
        }

        res.json({ message: "Device deleted", deleted });
    } catch (err) {
        next(err);
    }
});

export default router;