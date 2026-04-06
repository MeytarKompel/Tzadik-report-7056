import DailyReportModel, { IDailyReport } from "../4-models/daily-report-model";
import InventorySheetModel from "../4-models/inventory-sheet-model";
import InventoryItemModel from "../4-models/inventory-item-model";
import UserModel from "../4-models/user-model";
import DeviceModel from "../4-models/device-model";
import ReportModel from "../4-models/report-model";
import ClientError from "../2-utils/client-error";

type ReportDailyDeviceData = {
    personalNumber: string;
    phone: string;
    deviceNumber: string;
    reportDate: string;
    location?: string;
    notes?: string;
};

async function createDailySheetFromInventorySheet(
    sheetId: string,
    reportDate: string
): Promise<IDailyReport[]> {
    const sheet = await InventorySheetModel.findById(sheetId).exec();

    if (!sheet) {
        throw new ClientError(404, "Inventory sheet not found");
    }

    const existingReports = await DailyReportModel.find({
        sheetId,
        reportDate
    }).exec();

    if (existingReports.length > 0) {
        throw new ClientError(400, "Daily sheet already exists for this date");
    }

    const items = await InventoryItemModel.find({
        sheetId,
        isDeleted: false,
        status: { $in: ["assigned", "not_assigned"] }
    }).lean().exec();

    if (items.length === 0) {
        throw new ClientError(400, "No inventory items found for this sheet");
    }

    const dailyDocs = items.map(item => ({
        inventoryItemId: item._id,
        sheetId,
        deviceNumber: item.deviceNumber,
        reportDate,
        unit: item.unit,
        assignedToUserId: item.assignedToUserId ?? null,
        unitResponsibleUserId: item.unitResponsibleUserId,
        status: "not_reported" as const,
        location: null,
        reportedBy: null,
        notes: null
    }));

    return DailyReportModel.insertMany(dailyDocs);
}

async function getDailyReportsByDate(reportDate: string): Promise<IDailyReport[]> {
    return DailyReportModel.find({ reportDate })
        .sort({ createdAt: -1 })
        .exec();
}

async function getDailyReportsBySheetAndDate(
    sheetId: string,
    reportDate: string
): Promise<IDailyReport[]> {
    return DailyReportModel.find({ sheetId, reportDate })
        .sort({ createdAt: -1 })
        .exec();
}

async function reportDevice(data: ReportDailyDeviceData): Promise<IDailyReport> {
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

    const dailyReport = await DailyReportModel.findOne({
        deviceNumber: data.deviceNumber,
        reportDate: data.reportDate
    }).exec();

    if (!dailyReport) {
        throw new ClientError(404, "Daily report not found");
    }

    const inventoryItem = await InventoryItemModel.findOne({
        _id: dailyReport.inventoryItemId,
        sheetId: dailyReport.sheetId,
        deviceNumber: data.deviceNumber,
        isDeleted: false,
        status: { $in: ["assigned", "not_assigned"] }
    }).exec();

    if (!inventoryItem) {
        throw new ClientError(404, "Inventory item not found for this device");
    }

    const isAdmin = user.role === "admin";
    const isAssignedUser = inventoryItem.assignedToUserId === data.personalNumber;
    const isUnitResponsible =
        user.role === "mashkash" &&
        inventoryItem.unitResponsibleUserId === data.personalNumber;

    if (!isAdmin && !isAssignedUser && !isUnitResponsible) {
        throw new ClientError(403, "User is not allowed to report for this device");
    }

    if (dailyReport.status === "reported") {
        throw new ClientError(400, "Device already reported for this date");
    }

    dailyReport.status = "reported";
    dailyReport.reportedBy = data.personalNumber;
    dailyReport.location = data.location ?? null;
    dailyReport.notes = data.notes ?? null;

    await dailyReport.save();

    await InventoryItemModel.updateOne(
        { _id: inventoryItem._id },
        {
            $set: {
                lastReportDate: data.reportDate,
                lastReportStatus: "reported",
                lastReportedByUserId: data.personalNumber
            }
        }
    ).exec();

    const existingAuditReport = await ReportModel.findOne({
        deviceNumber: data.deviceNumber,
        reportDate: data.reportDate
    }).exec();

    if (!existingAuditReport) {
        await ReportModel.create({
            deviceNumber: data.deviceNumber,
            reportDate: data.reportDate,
            status: "reported",
            reportedBy: data.personalNumber,
            unit: inventoryItem.unit,
            location: data.location,
            notes: data.notes
        });
    }

    return dailyReport;
}

async function markDeviceAsNotReported(
    deviceNumber: string,
    reportDate: string
): Promise<IDailyReport | null> {
    const dailyReport = await DailyReportModel.findOneAndUpdate(
        { deviceNumber, reportDate },
        {
            status: "not_reported",
            reportedBy: null,
            location: null,
            notes: null
        },
        { new: true, runValidators: true }
    ).exec();

    if (!dailyReport) {
        return null;
    }

    await InventoryItemModel.updateOne(
        {
            _id: dailyReport.inventoryItemId,
            sheetId: dailyReport.sheetId,
            deviceNumber: dailyReport.deviceNumber,
            isDeleted: false
        },
        {
            $set: {
                lastReportDate: dailyReport.reportDate,
                lastReportStatus: "not_reported",
                lastReportedByUserId: null
            }
        }
    ).exec();

    return dailyReport;
}

async function getDailyReportsBySheet(sheetId: string) {
    return DailyReportModel.find({ sheetId }).lean().exec();
}

export default {
    createDailySheetFromInventorySheet,
    getDailyReportsByDate,
    getDailyReportsBySheetAndDate,
    reportDevice,
    markDeviceAsNotReported,
    getDailyReportsBySheet
};