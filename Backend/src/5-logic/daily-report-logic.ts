import DailyReportModel from "../4-models/daily-report-model";

// יצירת גיליון יומי
async function createDailySheetFromInventorySheet(
    sheetId: string,
    reportDate: string
): Promise<void> {

    const existing = await DailyReportModel.findOne({
        sheetId,
        reportDate
    }).exec();

    if (existing) {
        throw new Error("Daily sheet already exists for this date");
    }

    const InventoryItemModel = (await import("../4-models/inventory-item-model")).default;

    const items = await InventoryItemModel.find({
        sheetId,
        status: "assigned",
        isDeleted: false
    }).lean();

    const dailyDocs = items.map(item => ({
        sheetId,
        deviceNumber: item.deviceNumber,
        reportDate,
        unit: item.unit,
        assignedToUserId: item.assignedToUserId,
        unitResponsibleUserId: item.unitResponsibleUserId,
        status: "not_reported"
    }));

    await DailyReportModel.insertMany(dailyDocs);
}

async function reportDevice(
    deviceNumber: string,
    reportDate: string,
    userId: string,
    location?: string
) {
    const report = await DailyReportModel.findOneAndUpdate(
        { deviceNumber, reportDate },
        {
            status: "reported",
            reportedBy: userId,
            location
        },
        { new: true }
    );

    if (!report) {
        throw new Error("Daily report not found");
    }

    return report;
}
async function getDailyReportsByDate(reportDate: string) {
    return DailyReportModel.find({ reportDate }).sort({ createdAt: -1 }).exec();
}

export default {
    createDailySheetFromInventorySheet,
    reportDevice,
    getDailyReportsByDate
};