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
    } catch (err) {
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

router.get("/daily-reports/by-sheet/:sheetId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reports = await dailyReportLogic.getDailyReportsBySheet(req.params.sheetId);
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
    } catch (err) {
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