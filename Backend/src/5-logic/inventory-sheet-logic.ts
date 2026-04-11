import InventorySheetModel, {
  IInventorySheet,
} from "../4-models/inventory-sheet-model";
import UserModel from "../4-models/user-model";
import InventoryItemModel from "../4-models/inventory-item-model";
import DailyReportModel from "../4-models/daily-report-model";
import DeviceModel from "../4-models/device-model";
import ClientError from "../2-utils/client-error";
import inventoryItemLogic from "./inventory-item-logic";

async function getAllInventorySheets(): Promise<IInventorySheet[]> {
  return InventorySheetModel.find().sort({ createdAt: -1 }).exec();
}

async function getInventorySheetById(
  id: string,
): Promise<IInventorySheet | null> {
  return InventorySheetModel.findById(id).exec();
}

async function getInventorySheetsByStatus(
  status: string,
): Promise<IInventorySheet[]> {
  return InventorySheetModel.find({ status }).sort({ createdAt: -1 }).exec();
}

async function getInventorySheetsByCreatedByUserId(
  createdByUserId: string,
): Promise<IInventorySheet[]> {
  return InventorySheetModel.find({ createdByUserId })
    .sort({ createdAt: -1 })
    .exec();
}

async function addInventorySheet(
  sheet: IInventorySheet,
): Promise<IInventorySheet> {
  const creator = await UserModel.findOne({
    personalNumber: sheet.createdByUserId,
    isActive: true,
  }).exec();

  if (!creator) {
    throw new ClientError(404, "Created by user does not exist");
  }

  return InventorySheetModel.create(sheet);
}

async function createCleanInventorySheet(data: {
  sheetName: string;
  description?: string;
  createdByUserId: string;
}): Promise<IInventorySheet> {
  const creator = await UserModel.findOne({
    personalNumber: data.createdByUserId,
    isActive: true,
  }).exec();

  if (!creator) {
    throw new ClientError(404, "Created by user does not exist");
  }

  if (creator.role !== "admin") {
    throw new ClientError(403, "Only admin can create a new inventory sheet");
  }

  const newSheet = await InventorySheetModel.create({
    sheetName: data.sheetName,
    description: data.description ?? "",
    createdByUserId: data.createdByUserId,
    status: "active",
  });

  const devices = await DeviceModel.find({ isActive: true }).lean().exec();

  if (!devices.length) {
    throw new ClientError(400, "No devices found to create inventory items");
  }

  const items = devices.map((device) => ({
    sheetId: newSheet._id,
    deviceNumber: device.deviceNumber,
    unit: "מחסן",
    status: "not_assigned",
    assignedToUserId: null,
    unitResponsibleUserId: "00000",
    isDeleted: false,
  }));

  await InventoryItemModel.insertMany(items);

  console.log("✅ Inventory items created:", items.length);

  return newSheet;
}

async function updateInventorySheet(
  id: string,
  sheet: Partial<IInventorySheet>,
): Promise<IInventorySheet | null> {
  if (sheet.createdByUserId) {
    const creator = await UserModel.findOne({
      personalNumber: sheet.createdByUserId,
      isActive: true,
    }).exec();

    if (!creator) {
      throw new ClientError(404, "Created by user does not exist");
    }
  }

  return InventorySheetModel.findByIdAndUpdate(id, sheet, {
    new: true,
    runValidators: true,
  }).exec();
}

async function closeInventorySheet(
  id: string,
): Promise<IInventorySheet | null> {
  return InventorySheetModel.findByIdAndUpdate(
    id,
    { status: "closed" },
    { new: true, runValidators: true },
  ).exec();
}

async function reopenInventorySheet(
  id: string,
): Promise<IInventorySheet | null> {
  return InventorySheetModel.findByIdAndUpdate(
    id,
    { status: "active" },
    { new: true, runValidators: true },
  ).exec();
}

async function deleteInventorySheet(
  id: string,
): Promise<IInventorySheet | null> {
  return InventorySheetModel.findByIdAndDelete(id).exec();
}

async function getInventorySheetWithItems(id: string): Promise<any | null> {
  const sheet = await InventorySheetModel.findById(id).lean().exec();

  if (!sheet) {
    return null;
  }

  const items = await InventoryItemModel.find({
    sheetId: id,
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  return {
    ...sheet,
    items,
    itemsCount: items.length,
  };
}

async function addInventoryItemToSheet(
  sheetId: string,
  item: any,
): Promise<any> {
  const sheet = await InventorySheetModel.findById(sheetId).exec();

  if (!sheet) {
    throw new ClientError(404, "Inventory sheet not found");
  }

  if (sheet.status !== "active") {
    throw new ClientError(400, "Cannot add items to a closed inventory sheet");
  }

  return inventoryItemLogic.addInventoryItem({
    ...item,
    _id: `${sheetId}_${item.deviceNumber}`,
    sheetId,
  });
}

async function getInventorySheetSummary(id: string): Promise<any | null> {
  const sheet = await InventorySheetModel.findById(id).lean().exec();

  if (!sheet) {
    return null;
  }

  const items = await InventoryItemModel.find({
    sheetId: id,
    isDeleted: false,
  })
    .lean()
    .exec();

  const totalItems = items.length;
  const assignedItems = items.filter(
    (item) => item.status === "assigned",
  ).length;
  const returnedItems = items.filter(
    (item) => item.status === "returned",
  ).length;
  const inWarehouseItems = items.filter(
    (item) => item.status === "not_assigned",
  ).length;
  const reportedToday = items.filter(
    (item) => item.lastReportStatus === "reported",
  ).length;
  const notReportedToday = items.filter(
    (item) => item.lastReportStatus === "not_reported",
  ).length;

  return {
    _id: sheet._id,
    sheetName: sheet.sheetName,
    description: sheet.description,
    status: sheet.status,
    createdByUserId: sheet.createdByUserId,
    createdAt: sheet.createdAt,
    updatedAt: sheet.updatedAt,
    summary: {
      totalItems,
      assignedItems,
      returnedItems,
      inWarehouseItems,
      reportedToday,
      notReportedToday,
    },
  };
}

async function getInventorySheetFull(
  id: string,
  reportDate?: string,
): Promise<any | null> {
  const sheet = await InventorySheetModel.findById(id).lean().exec();

  if (!sheet) {
    return null;
  }

  const items = await InventoryItemModel.find({
    sheetId: id,
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  const effectiveReportDate =
    reportDate ?? new Date().toISOString().slice(0, 10);

  const dailyReports = await DailyReportModel.find({
    sheetId: id,
    reportDate: effectiveReportDate,
  })
    .lean()
    .exec();

  const deviceNumbers = items.map((item) => item.deviceNumber);

  const assignedUserIds = items
    .map((item) => item.assignedToUserId)
    .filter(Boolean) as string[];

  const unitResponsibleUserIds = items
    .map((item) => item.unitResponsibleUserId)
    .filter(Boolean) as string[];

  const reportedByUserIds = dailyReports
    .map((report) => report.reportedBy)
    .filter(Boolean) as string[];

  const allUserIds = Array.from(
    new Set(
      assignedUserIds.concat(unitResponsibleUserIds).concat(reportedByUserIds),
    ),
  );

  const [devices, users, activeUsersForUnits] = await Promise.all([
    DeviceModel.find({
      deviceNumber: { $in: deviceNumbers },
      isActive: true,
    })
      .lean()
      .exec(),

    UserModel.find({
      personalNumber: { $in: allUserIds },
      isActive: true,
    })
      .lean()
      .exec(),

    UserModel.find({
      isActive: true,
      unit: { $exists: true, $nin: [null, ""] },
    })
      .select("unit")
      .lean()
      .exec(),
  ]);

  const availableUnits = Array.from(
    new Set(
      activeUsersForUnits
        .map((user) => String(user.unit ?? "").trim())
        .filter((unit) => unit.length > 0)
        .concat(["מחסן"]),
    ),
  ).sort((a, b) => a.localeCompare(b, "he"));

  const devicesMap = new Map(
    devices.map((device) => [device.deviceNumber, device]),
  );

  const usersMap = new Map(users.map((user) => [user.personalNumber, user]));

  const dailyReportsMap = new Map(
    dailyReports.map((report) => [report.deviceNumber, report]),
  );

  const rows = items.map((item) => {
    const device = devicesMap.get(item.deviceNumber);
    const dailyReport = dailyReportsMap.get(item.deviceNumber);

    const assignedUser = item.assignedToUserId
      ? usersMap.get(item.assignedToUserId)
      : null;

    const unitResponsibleUser = item.unitResponsibleUserId
      ? usersMap.get(item.unitResponsibleUserId)
      : null;

    const reportedByUser = dailyReport?.reportedBy
      ? usersMap.get(dailyReport.reportedBy)
      : null;

    return {
      inventoryItemId: item._id,
      sheetId: item.sheetId,
      deviceNumber: item.deviceNumber,
      deviceName: device?.deviceName ?? null,
      unit: item.unit,
      status: item.status,

      assignedToUser: item.assignedToUserId
        ? {
            personalNumber: item.assignedToUserId,
            fullName: assignedUser?.fullName ?? null,
            phone: assignedUser?.phone ?? null,
          }
        : null,

      unitResponsibleUser: item.unitResponsibleUserId
        ? {
            personalNumber: item.unitResponsibleUserId,
            fullName: unitResponsibleUser?.fullName ?? null,
            phone: unitResponsibleUser?.phone ?? null,
          }
        : null,

      signedAt: item.signedAt ?? null,
      returnedAt: item.returnedAt ?? null,

      dailyReport: dailyReport
        ? {
            id: dailyReport._id,
            reportDate: dailyReport.reportDate,
            status: dailyReport.status,
            location: dailyReport.location ?? null,
            reportedBy: dailyReport.reportedBy ?? null,
            reportedByName: reportedByUser?.fullName ?? null,
            notes: dailyReport.notes ?? null,
          }
        : {
            id: null,
            reportDate: effectiveReportDate,
            status: "not_reported",
            location: null,
            reportedBy: null,
            reportedByName: null,
            notes: null,
          },

      lastReportDate: item.lastReportDate ?? null,
      lastReportStatus: item.lastReportStatus ?? null,
      lastReportedByUserId: item.lastReportedByUserId ?? null,
    };
  });

  return {
    sheet,
    reportDate: effectiveReportDate,
    items,
    dailyReports,
    rows,
    availableUnits,
    counts: {
      itemsCount: items.length,
      reportedCount: rows.filter((row) => row.dailyReport.status === "reported")
        .length,
      notReportedCount: rows.filter(
        (row) => row.dailyReport.status === "not_reported",
      ).length,
      assignedCount: rows.filter((row) => row.status === "assigned").length,
      inWarehouseCount: rows.filter((row) => row.status === "not_assigned")
        .length,
      returnedCount: rows.filter((row) => row.status === "returned").length,
    },
  };
}

export default {
  getAllInventorySheets,
  getInventorySheetById,
  getInventorySheetsByStatus,
  getInventorySheetsByCreatedByUserId,
  addInventorySheet,
  createCleanInventorySheet,
  updateInventorySheet,
  closeInventorySheet,
  reopenInventorySheet,
  deleteInventorySheet,
  getInventorySheetWithItems,
  addInventoryItemToSheet,
  getInventorySheetSummary,
  getInventorySheetFull,
};
