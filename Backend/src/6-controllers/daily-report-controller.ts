import express, { Request, Response, NextFunction } from "express";
import dailyReportLogic from "../5-logic/daily-report-logic";

const router = express.Router();

// CREATE DAILY SHEET
router.post("/daily-reports/create", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sheetId, reportDate } = req.body;

        const created = await dailyReportLogic.createDailySheetFromInventorySheet(
            sheetId,
            reportDate
        );

        res.status(201).json({
            message: "Daily sheet created successfully",
            count: created.length,
            dailyReports: created
        });
    } catch (err: any) {
        if (
            err.message === "Inventory sheet not found" ||
            err.message === "Daily sheet already exists for this date" ||
            err.message === "No inventory items found for this sheet"
        ) {
            return res.status(400).json({ message: err.message });
        }

        next(err);
    }
});

// GET BY DATE
router.get("/daily-reports/by-date/:reportDate", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reports = await dailyReportLogic.getDailyReportsByDate(req.params.reportDate);
        res.json(reports);
    } catch (err) {
        next(err);
    }
});

// GET BY SHEET AND DATE
router.get("/daily-reports/:sheetId/:reportDate", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reports = await dailyReportLogic.getDailyReportsBySheetAndDate(
            req.params.sheetId,
            req.params.reportDate
        );
        res.json(reports);
    } catch (err) {
        next(err);
    }
});

// REPORT DEVICE
router.post("/daily-reports/report", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const report = await dailyReportLogic.reportDevice(req.body);
        res.json(report);
    } catch (err: any) {
        if (
            err.message === "User identification failed" ||
            err.message === "Device not found" ||
            err.message === "Daily report not found" ||
            err.message === "Inventory item not found for this device" ||
            err.message === "User is not allowed to report for this device" ||
            err.message === "Device already reported for this date"
        ) {
            return res.status(400).json({ message: err.message });
        }

        next(err);
    }
});

// MARK NOT REPORTED
router.patch("/daily-reports/not-reported", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { deviceNumber, reportDate } = req.body;

        const report = await dailyReportLogic.markDeviceAsNotReported(
            deviceNumber,
            reportDate
        );

        if (!report) {
            return res.status(404).json({ message: "Daily report not found" });
        }

        res.json(report);
    } catch (err) {
        next(err);
    }
});

export default router;