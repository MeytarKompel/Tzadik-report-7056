import ReportModel, { IReport, ReportStatus } from "../4-models/report-model";
import DeviceModel from "../4-models/device-model";
import UserModel from "../4-models/user-model";
import InventoryItemModel from "../4-models/inventory-item-model";
import ClientError from "../2-utils/client-error";

type CreateSecureReportData = {
    personalNumber: string;
    phone: string;
    deviceNumber: string;
    reportDate: string;
    status: ReportStatus;
    location?: string;
    notes?: string;
};

async function getAllReports(): Promise<IReport[]> {
    return ReportModel.find()
        .sort({ createdAt: -1 })
        .exec();
}

async function getReportsByDate(reportDate: string): Promise<IReport[]> {
    return ReportModel.find({ reportDate })
        .sort({ createdAt: -1 })
        .exec();
}

async function getReportsByDeviceNumber(deviceNumber: string): Promise<IReport[]> {
    return ReportModel.find({ deviceNumber })
        .sort({ createdAt: -1 })
        .exec();
}

async function getReportsByUnit(unit: string): Promise<IReport[]> {
    return ReportModel.find({ unit })
        .sort({ createdAt: -1 })
        .exec();
}

async function getReportsByUnitAndDate(unit: string, reportDate: string): Promise<IReport[]> {
    return ReportModel.find({ unit, reportDate })
        .sort({ createdAt: -1 })
        .exec();
}

async function getDailyMissingReports(reportDate: string): Promise<IReport[]> {
    return ReportModel.find({
        reportDate,
        status: "not_reported"
    })
        .sort({ createdAt: -1 })
        .exec();
}

async function addReport(report: IReport): Promise<IReport> {
    const existingDevice = await DeviceModel.findOne({
        deviceNumber: report.deviceNumber,
        isActive: true
    }).exec();

    if (!existingDevice) {
        throw new ClientError(404, "Device number does not exist");
    }

    const existingReport = await ReportModel.findOne({
        deviceNumber: report.deviceNumber,
        reportDate: report.reportDate
    }).exec();

    if (existingReport) {
        throw new ClientError(400, "A report for this device already exists for this date");
    }

    const addedReport = await ReportModel.create(report);

    await InventoryItemModel.updateOne(
        {
            deviceNumber: report.deviceNumber,
            status: "assigned",
            isDeleted: false
        },
        {
            $set: {
                lastReportDate: report.reportDate,
                lastReportStatus: report.status,
                lastReportedByUserId: report.reportedBy ?? null
            }
        }
    ).exec();

    return addedReport;
}

async function createSecureReport(data: CreateSecureReportData): Promise<IReport> {
    const normalizedPhone = data.phone.replace(/\D/g, "");

    const user = await UserModel.findOne({
        personalNumber: data.personalNumber,
        phone: normalizedPhone,
        isActive: true
    }).exec();

    if (!user) {
        throw new ClientError(400, "User identification failed");
    }

    const device = await DeviceModel.findOne({
        deviceNumber: data.deviceNumber,
        isActive: true
    }).exec();

    if (!device) {
        throw new ClientError(404, "Device not found");
    }

    const inventoryItem = await InventoryItemModel.findOne({
        deviceNumber: data.deviceNumber,
        status: "assigned",
        isDeleted: false
    }).exec();

    if (!inventoryItem) {
        throw new ClientError(404, "Inventory item not found for this device");
    }

    const isAdmin = user.role === "admin";
    const isAssignedUser = inventoryItem.assignedToUserId === data.personalNumber;
    const isUnitResponsible =
        user.role === "unit_equipment_manager" &&
        inventoryItem.unitResponsibleUserId === data.personalNumber;

    if (!isAdmin && !isAssignedUser && !isUnitResponsible) {
        throw new ClientError(403, "User is not allowed to report for this device");
    }

    const existingReport = await ReportModel.findOne({
        deviceNumber: data.deviceNumber,
        reportDate: data.reportDate
    }).exec();

    if (existingReport) {
        throw new ClientError(400, "A report for this device already exists for this date");
    }

    const report = await ReportModel.create({
        deviceNumber: data.deviceNumber,
        reportDate: data.reportDate,
        status: data.status,
        reportedBy: data.personalNumber,
        unit: inventoryItem.unit,
        location: data.location,
        notes: data.notes
    });

    await InventoryItemModel.updateOne(
        { _id: inventoryItem._id },
        {
            $set: {
                lastReportDate: data.reportDate,
                lastReportStatus: data.status,
                lastReportedByUserId: data.personalNumber
            }
        }
    ).exec();

    return report;
}

async function updateReport(id: string, report: Partial<IReport>): Promise<IReport | null> {
    if (report.deviceNumber) {
        const existingDevice = await DeviceModel.findOne({
            deviceNumber: report.deviceNumber,
            isActive: true
        }).exec();

        if (!existingDevice) {
            throw new ClientError(404, "Device number does not exist");
        }
    }

    const currentReport = await ReportModel.findById(id).exec();

    if (!currentReport) {
        return null;
    }

    const deviceNumber = report.deviceNumber ?? currentReport.deviceNumber;
    const reportDate = report.reportDate ?? currentReport.reportDate;

    const duplicateReport = await ReportModel.findOne({
        _id: { $ne: id },
        deviceNumber,
        reportDate
    }).exec();

    if (duplicateReport) {
        throw new ClientError(400, "A report for this device already exists for this date");
    }

    const updatedReport = await ReportModel.findByIdAndUpdate(
        id,
        report,
        {
            new: true,
            runValidators: true
        }
    ).exec();

    if (updatedReport) {
        await InventoryItemModel.updateOne(
            {
                deviceNumber: updatedReport.deviceNumber,
                status: "assigned",
                isDeleted: false
            },
            {
                $set: {
                    lastReportDate: updatedReport.reportDate,
                    lastReportStatus: updatedReport.status,
                    lastReportedByUserId: updatedReport.reportedBy ?? null
                }
            }
        ).exec();
    }

    return updatedReport;
}

async function deleteReport(id: string): Promise<IReport | null> {
    return ReportModel.findByIdAndDelete(id).exec();
}

export default {
    getAllReports,
    getReportsByDate,
    getReportsByDeviceNumber,
    getReportsByUnit,
    getReportsByUnitAndDate,
    getDailyMissingReports,
    addReport,
    createSecureReport,
    updateReport,
    deleteReport
};