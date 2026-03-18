import InventoryItemModel from "../4-models/inventory-item-model";
import DailyReportModel from "../4-models/daily-report-model";

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