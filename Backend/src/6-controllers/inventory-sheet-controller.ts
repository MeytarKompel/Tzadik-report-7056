import express, { Request, Response, NextFunction } from "express";
import inventorySheetLogic from "../5-logic/inventory-sheet-logic";

const router = express.Router();

// GET ALL
router.get("/inventory-sheets", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sheets = await inventorySheetLogic.getAllInventorySheets();
        res.json(sheets);
    } catch (err) {
        next(err);
    }
});

// GET SHEET WITH ALL ITEMS
router.get("/inventory-sheets/:id/with-items", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sheet = await inventorySheetLogic.getInventorySheetWithItems(req.params.id);

        if (!sheet) {
            return res.status(404).json({ message: "Inventory sheet not found" });
        }

        res.json(sheet);
    } catch (err) {
        next(err);
    }
});

// GET SHEET SUMMARY
router.get("/inventory-sheets/:id/summary", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const summary = await inventorySheetLogic.getInventorySheetSummary(req.params.id);

        if (!summary) {
            return res.status(404).json({ message: "Inventory sheet not found" });
        }

        res.json(summary);
    } catch (err) {
        next(err);
    }
});

// GET SHEET FULL
router.get("/inventory-sheets/:id/full", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sheet = await inventorySheetLogic.getInventorySheetFull(
            req.params.id,
            req.query.reportDate as string | undefined
        );

        if (!sheet) {
            return res.status(404).json({ message: "Inventory sheet not found" });
        }

        res.json(sheet);
    } catch (err) {
        next(err);
    }
});

// ADD ITEM TO SHEET
router.post("/inventory-sheets/:id/items", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const item = await inventorySheetLogic.addInventoryItemToSheet(req.params.id, req.body);
        res.status(201).json(item);
    } catch (err) {
        next(err);
    }
});

// GET BY STATUS
router.get("/inventory-sheets/by-status/:status", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sheets = await inventorySheetLogic.getInventorySheetsByStatus(req.params.status);
        res.json(sheets);
    } catch (err) {
        next(err);
    }
});

// GET BY CREATOR
router.get("/inventory-sheets/by-creator/:createdByUserId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sheets = await inventorySheetLogic.getInventorySheetsByCreatedByUserId(req.params.createdByUserId);
        res.json(sheets);
    } catch (err) {
        next(err);
    }
});

// GET BY ID
router.get("/inventory-sheets/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sheet = await inventorySheetLogic.getInventorySheetById(req.params.id);

        if (!sheet) {
            return res.status(404).json({ message: "Inventory sheet not found" });
        }

        res.json(sheet);
    } catch (err) {
        next(err);
    }
});

// CREATE REGULAR
router.post("/inventory-sheets", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sheet = await inventorySheetLogic.addInventorySheet(req.body);
        res.status(201).json(sheet);
    } catch (err) {
        next(err);
    }
});

// CREATE CLEAN SHEET FOR ADMIN PLUS BUTTON
router.post("/inventory-sheets/create-clean", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sheet = await inventorySheetLogic.createCleanInventorySheet(req.body);
        res.status(201).json(sheet);
    } catch (err) {
        next(err);
    }
});

// UPDATE
router.put("/inventory-sheets/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sheet = await inventorySheetLogic.updateInventorySheet(req.params.id, req.body);

        if (!sheet) {
            return res.status(404).json({ message: "Inventory sheet not found" });
        }

        res.json(sheet);
    } catch (err) {
        next(err);
    }
});

// CLOSE SHEET
router.patch("/inventory-sheets/:id/close", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sheet = await inventorySheetLogic.closeInventorySheet(req.params.id);

        if (!sheet) {
            return res.status(404).json({ message: "Inventory sheet not found" });
        }

        res.json(sheet);
    } catch (err) {
        next(err);
    }
});

// REOPEN SHEET
router.patch("/inventory-sheets/:id/reopen", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sheet = await inventorySheetLogic.reopenInventorySheet(req.params.id);

        if (!sheet) {
            return res.status(404).json({ message: "Inventory sheet not found" });
        }

        res.json(sheet);
    } catch (err) {
        next(err);
    }
});

// DELETE
router.delete("/inventory-sheets/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sheet = await inventorySheetLogic.deleteInventorySheet(req.params.id);

        if (!sheet) {
            return res.status(404).json({ message: "Inventory sheet not found" });
        }

        res.json({ message: "Inventory sheet deleted", sheet });
    } catch (err) {
        next(err);
    }
});

export default router;