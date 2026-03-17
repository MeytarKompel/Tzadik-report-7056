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
router.get("/devices/:deviceNumber", async (req, res, next) => {
    try {
        const device = await deviceLogic.getDeviceByNumber(req.params.deviceNumber);

        if (!device) return res.status(404).json({ message: "Device not found" });

        res.json(device);
    } catch (err) {
        next(err);
    }
});


// GET BY NAME
router.get("/devices/:deviceName", async (req, res, next) => {
    try {
        const device = await deviceLogic.getDeviceByName(req.params.deviceName);

        if (!device) return res.status(404).json({ message: "Device not found" });

        res.json(device);
    } catch (err) {
        next(err);
    }
});



// CREATE
router.post("/devices", async (req, res, next) => {
    try {
        const device = await deviceLogic.addDevice(req.body);
        res.status(201).json(device);
    } catch (err: any) {
        if (err.message === "Device number already exists") {
            return res.status(400).json({ message: err.message });
        }
        next(err);
    }
});

// UPDATE
router.put("/devices/:deviceNumber", async (req, res, next) => {
    try {
        const updated = await deviceLogic.updateDeviceByMongoId(
            req.params.deviceNumber,
            req.body
        );

        if (!updated) return res.status(404).json({ message: "Device not found" });

        res.json(updated);
    } catch (err: any) {
        if (err.message === "Device number already exists") {
            return res.status(400).json({ message: err.message });
        }
        next(err);
    }
});

// DELETE
router.delete("/devices/:deviceNumber", async (req, res, next) => {
    try {
        const deleted = await deviceLogic.deleteDeviceByMongoId(req.params.deviceNumber);

        if (!deleted) return res.status(404).json({ message: "Device not found" });

        res.json({ message: "Device deleted", deleted });
    } catch (err) {
        next(err);
    }
});

export default router;