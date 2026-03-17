import ReportModel, { IReport } from "../4-models/report-model";
import DeviceModel from "../4-models/device-model";

async function getAllReports(): Promise<IReport[]> {
    return ReportModel.find().sort({ createdAt: -1 }).exec();
}

async function getReportsByDate(reportDate: string): Promise<IReport[]> {
    return ReportModel.find({ reportDate }).sort({ createdAt: -1 }).exec();
}

async function getReportsByDeviceNumber(deviceNumber: string): Promise<IReport[]> {
    return ReportModel.find({ deviceNumber }).sort({ createdAt: -1 }).exec();
}

async function getReportsByUnitName(unit: string): Promise<IReport[]> {
    return ReportModel.find({ unit }).sort({ createdAt: -1 }).exec();
}

async function getReportsByUnitNameAndDate(unit: string, reportDate: string): Promise<IReport[]> {
    return ReportModel.find({
        unit,
        reportDate
    }).sort({ createdAt: -1 }).exec();
}

async function getDailyMissingReports(reportDate: string): Promise<IReport[]> {
    return ReportModel.find({
        reportDate,
        status: "not_reported"
    }).sort({ createdAt: -1 }).exec();
}

async function addReport(report: IReport): Promise<IReport> {
    const existingDevice = await DeviceModel.findOne({
        deviceNumber: report.deviceNumber
    }).exec();

    if (!existingDevice) throw new Error("Device number does not exist");

    const existingReport = await ReportModel.findOne({
        deviceNumber: report.deviceNumber,
        reportDate: report.reportDate
    }).exec();

    if (existingReport) throw new Error("A report for this device already exists for this date");

    return ReportModel.create(report);
}

async function updateReport(id: string, report: Partial<IReport>): Promise<IReport | null> {
    if (report.deviceNumber) {
        const existingDevice = await DeviceModel.findOne({
            deviceNumber: report.deviceNumber
        }).exec();

        if (!existingDevice) throw new Error("Device number does not exist");
    }

    const currentReport = await ReportModel.findById(id).exec();

    if (!currentReport) return null;

    const deviceNumber = report.deviceNumber ?? currentReport.deviceNumber;
    const reportDate = report.reportDate ?? currentReport.reportDate;

    const duplicateReport = await ReportModel.findOne({
        _id: { $ne: id },
        deviceNumber,
        reportDate
    }).exec();

    if (duplicateReport) throw new Error("A report for this device already exists for this date");

    return ReportModel.findByIdAndUpdate(
        id,
        report,
        { new: true, runValidators: true }
    ).exec();
}

async function deleteReport(id: string): Promise<IReport | null> {
    return ReportModel.findByIdAndDelete(id).exec();
}

export default {
    getAllReports,
    getReportsByDate,
    getReportsByDeviceNumber,
    getReportsByUnitName,
    getReportsByUnitNameAndDate,
    getDailyMissingReports,
    addReport,
    updateReport,
    deleteReport
};