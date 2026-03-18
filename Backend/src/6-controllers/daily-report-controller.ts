import express, { Request, Response, NextFunction } from "express";
import dailyReportLogic from "../5-logic/daily-report-logic";

const router = express.Router();

// יצירת גיליון יומי
router.post("/daily-reports/create", async (req, res, next) => {
    try {
        const { sheetId, reportDate } = req.body;

        await dailyReportLogic.createDailySheetFromInventorySheet(sheetId, reportDate);

        res.status(201).json({ message: "Daily sheet created" });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// דיווח
router.post("/daily-reports/report", async (req, res, next) => {
    try {
        const { deviceNumber, reportDate, userId, location } = req.body;

        const report = await dailyReportLogic.reportDevice(
            deviceNumber,
            reportDate,
            userId,
            location
        );

        res.json(report);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

export default router;