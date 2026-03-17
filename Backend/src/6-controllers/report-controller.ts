import express, { Request, Response, NextFunction } from "express";
import reportLogic from "../5-logic/report-logic";

const router = express.Router();

// GET ALL REPORTS
router.get("/reports", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reports = await reportLogic.getAllReports();
        res.json(reports);
    } catch (err) {
        next(err);
    }
});

// GET REPORTS BY DATE
router.get("/reports/by-date/:reportDate", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reports = await reportLogic.getReportsByDate(req.params.reportDate);
        res.json(reports);
    } catch (err) {
        next(err);
    }
});

// GET REPORTS BY DEVICE NUMBER
router.get("/reports/by-device/:deviceNumber", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reports = await reportLogic.getReportsByDeviceNumber(req.params.deviceNumber);
        res.json(reports);
    } catch (err) {
        next(err);
    }
});

// GET REPORTS BY UNIT
router.get("/reports/by-unit/:unit", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reports = await reportLogic.getReportsByUnit(req.params.unit);
        res.json(reports);
    } catch (err) {
        next(err);
    }
});

// GET REPORTS BY UNIT AND DATE
router.get("/reports/by-unit/:unit/by-date/:reportDate", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reports = await reportLogic.getReportsByUnitAndDate(
            req.params.unit,
            req.params.reportDate
        );
        res.json(reports);
    } catch (err) {
        next(err);
    }
});

// GET DAILY NOT REPORTED
router.get("/reports/missing/:reportDate", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reports = await reportLogic.getDailyMissingReports(req.params.reportDate);
        res.json(reports);
    } catch (err) {
        next(err);
    }
});

// CREATE REPORT
router.post("/reports", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const report = await reportLogic.addReport(req.body);
        res.status(201).json(report);
    } catch (err: any) {
        if (
            err.message === "Device number does not exist" ||
            err.message === "A report for this device already exists for this date"
        ) {
            return res.status(400).json({ message: err.message });
        }

        next(err);
    }
});

// UPDATE REPORT
router.put("/reports/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const report = await reportLogic.updateReport(req.params.id, req.body);

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        res.json(report);
    } catch (err: any) {
        if (
            err.message === "Device number does not exist" ||
            err.message === "A report for this device already exists for this date"
        ) {
            return res.status(400).json({ message: err.message });
        }

        next(err);
    }
});

// DELETE REPORT
router.delete("/reports/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deleted = await reportLogic.deleteReport(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Report not found" });
        }

        res.json({ message: "Report deleted", deleted });
    } catch (err) {
        next(err);
    }
});

export default router;