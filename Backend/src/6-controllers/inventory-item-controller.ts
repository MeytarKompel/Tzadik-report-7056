import express, { Request, Response, NextFunction } from "express";
import inventoryItemLogic from "../5-logic/inventory-item-logic";

const router = express.Router();

// GET ALL
router.get("/inventory-items", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items = await inventoryItemLogic.getAllInventoryItems();
        res.json(items);
    } catch (err) {
        next(err);
    }
});

router.get("/inventory-items/daily-status/:reportDate", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items = await inventoryItemLogic.getDailyInventoryStatus(req.params.reportDate);
        res.json(items);
    } catch (err) {
        next(err);
    }
});

// GET BY ID
router.get("/inventory-items/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const item = await inventoryItemLogic.getInventoryItemById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: "Inventory item not found" });
        }

        res.json(item);
    } catch (err) {
        next(err);
    }
});

// GET BY SHEET ID
router.get("/inventory-items/by-sheet/:sheetId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items = await inventoryItemLogic.getInventoryItemsBySheetId(req.params.sheetId);
        res.json(items);
    } catch (err) {
        next(err);
    }
});

// GET BY DEVICE NUMBER
router.get("/inventory-items/by-device/:deviceNumber", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items = await inventoryItemLogic.getInventoryItemsByDeviceNumber(req.params.deviceNumber);
        res.json(items);
    } catch (err) {
        next(err);
    }
});

// GET BY ASSIGNED USER
router.get("/inventory-items/by-assigned-user/:assignedToUserId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items = await inventoryItemLogic.getInventoryItemsByAssignedToUserId(req.params.assignedToUserId);
        res.json(items);
    } catch (err) {
        next(err);
    }
});

// GET BY UNIT RESPONSIBLE USER
router.get("/inventory-items/by-unit-responsible/:unitResponsibleUserId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items = await inventoryItemLogic.getInventoryItemsByUnitResponsibleUserId(req.params.unitResponsibleUserId);
        res.json(items);
    } catch (err) {
        next(err);
    }
});

// GET BY UNIT
router.get("/inventory-items/by-unit/:unit", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items = await inventoryItemLogic.getInventoryItemsByUnit(req.params.unit);
        res.json(items);
    } catch (err) {
        next(err);
    }
});

// GET BY STATUS
router.get("/inventory-items/by-status/:status", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items = await inventoryItemLogic.getInventoryItemsByStatus(req.params.status);
        res.json(items);
    } catch (err) {
        next(err);
    }
});

// CREATE
router.post("/inventory-items", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const item = await inventoryItemLogic.addInventoryItem(req.body);
        res.status(201).json(item);
    } catch (err: any) {
        if (
            err.message === "Device number does not exist" ||
            err.message === "Assigned user does not exist" ||
            err.message === "Unit responsible user does not exist" ||
            err.message === "Inventory item already exists for this sheet and device number"
        ) {
            return res.status(400).json({ message: err.message });
        }

        next(err);
    }
});

// UPDATE
router.put("/inventory-items/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const item = await inventoryItemLogic.updateInventoryItem(req.params.id, req.body);

        if (!item) {
            return res.status(404).json({ message: "Inventory item not found" });
        }

        res.json(item);
    } catch (err: any) {
        if (
            err.message === "Device number does not exist" ||
            err.message === "Assigned user does not exist" ||
            err.message === "Unit responsible user does not exist" ||
            err.message === "Inventory item already exists for this sheet and device number"
        ) {
            return res.status(400).json({ message: err.message });
        }

        next(err);
    }
});

// RETURN ITEM
router.patch("/inventory-items/:id/return", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const item = await inventoryItemLogic.returnInventoryItem(
            req.params.id,
            req.body.returnedAt ? new Date(req.body.returnedAt) : undefined
        );

        if (!item) {
            return res.status(404).json({ message: "Inventory item not found" });
        }

        res.json(item);
    } catch (err) {
        next(err);
    }
});

// UPDATE LAST REPORT STATUS
router.patch("/inventory-items/:id/last-report", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { reportDate, reportStatus, reportedByUserId } = req.body;

        const item = await inventoryItemLogic.updateLastReportStatus(
            req.params.id,
            reportDate,
            reportStatus,
            reportedByUserId
        );

        if (!item) {
            return res.status(404).json({ message: "Inventory item not found" });
        }

        res.json(item);
    } catch (err) {
        next(err);
    }
});

// SOFT DELETE
router.delete("/inventory-items/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const item = await inventoryItemLogic.softDeleteInventoryItem(req.params.id);

        if (!item) {
            return res.status(404).json({ message: "Inventory item not found" });
        }

        res.json({ message: "Inventory item deleted", item });
    } catch (err) {
        next(err);
    }
});

export default router;