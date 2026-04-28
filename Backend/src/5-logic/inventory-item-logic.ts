import InventoryItemModel, {
  IInventoryItem,
} from "../4-models/inventory-item-model";
import UserModel from "../4-models/user-model";
import DeviceModel from "../4-models/device-model";
import ReportModel from "../4-models/report-model";
import ClientError from "../2-utils/client-error";
import DailyReportModel from "../4-models/daily-report-model";

async function getAllInventoryItems(): Promise<IInventoryItem[]> {
  return InventoryItemModel.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .exec();
}

async function getInventoryItemById(
  id: string,
): Promise<IInventoryItem | null> {
  return InventoryItemModel.findOne({ _id: id, isDeleted: false }).exec();
}

async function getInventoryItemsBySheetId(
  sheetId: string,
): Promise<IInventoryItem[]> {
  return InventoryItemModel.find({ sheetId, isDeleted: false })
    .sort({ createdAt: -1 })
    .exec();
}

async function getInventoryItemsByDeviceNumber(
  deviceNumber: string,
): Promise<IInventoryItem[]> {
  return InventoryItemModel.find({ deviceNumber, isDeleted: false })
    .sort({ createdAt: -1 })
    .exec();
}

async function getInventoryItemsByAssignedToUserId(
  assignedToUserId: string,
): Promise<IInventoryItem[]> {
  return InventoryItemModel.find({ assignedToUserId, isDeleted: false })
    .sort({ createdAt: -1 })
    .exec();
}

async function getInventoryItemsByUnitResponsibleUserId(
  unitResponsibleUserId: string,
): Promise<IInventoryItem[]> {
  return InventoryItemModel.find({ unitResponsibleUserId, isDeleted: false })
    .sort({ createdAt: -1 })
    .exec();
}

async function getInventoryItemsByUnit(
  unit: string,
): Promise<IInventoryItem[]> {
  return InventoryItemModel.find({ unit, isDeleted: false })
    .sort({ createdAt: -1 })
    .exec();
}

async function getInventoryItemsByStatus(
  status: string,
): Promise<IInventoryItem[]> {
  return InventoryItemModel.find({ status, isDeleted: false })
    .sort({ createdAt: -1 })
    .exec();
}

async function getActiveAssignedInventoryItemForUserAndDevice(
  assignedToUserId: string,
  deviceNumber: string,
): Promise<IInventoryItem | null> {
  return InventoryItemModel.findOne({
    assignedToUserId,
    deviceNumber,
    status: "assigned",
    isDeleted: false,
  }).exec();
}

async function getDailyInventoryStatus(reportDate: string): Promise<any[]> {
  const items = await InventoryItemModel.find({
    isDeleted: false,
    status: "assigned",
  })
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  const result = await Promise.all(
    items.map(async (item) => {
      const [report, device, assignedUser, unitResponsibleUser] =
        await Promise.all([
          ReportModel.findOne({
            deviceNumber: item.deviceNumber,
            reportDate,
          })
            .lean()
            .exec(),

          DeviceModel.findOne({
            deviceNumber: item.deviceNumber,
            isActive: true,
          })
            .lean()
            .exec(),

          UserModel.findOne({
            personalNumber: item.assignedToUserId,
            isActive: true,
          })
            .lean()
            .exec(),

          UserModel.findOne({
            personalNumber: item.unitResponsibleUserId,
            isActive: true,
          })
            .lean()
            .exec(),
        ]);

      return {
        inventoryItemId: item._id,
        deviceNumber: item.deviceNumber,
        deviceName: device?.deviceName ?? null,
        unit: item.unit,
        assignedUser: {
          personalNumber: item.assignedToUserId,
          fullName: assignedUser?.fullName ?? null,
          phone: assignedUser?.phone ?? null,
        },
        unitResponsibleUser: {
          personalNumber: item.unitResponsibleUserId,
          fullName: unitResponsibleUser?.fullName ?? null,
          phone: unitResponsibleUser?.phone ?? null,
        },
        reportDate,
        dailyReportStatus: report?.status ?? "not_reported",
        reportId: report?._id ?? null,
        lastReportDate: item.lastReportDate ?? null,
        lastReportStatus: item.lastReportStatus ?? null,
        lastReportedByUserId: item.lastReportedByUserId ?? null,
        canManagerReport: true,
      };
    }),
  );

  return result;
}

async function getDailyInventoryStatusByUnitResponsibleUserId(
  unitResponsibleUserId: string,
  reportDate: string,
): Promise<any[]> {
  const items = await InventoryItemModel.find({
    unitResponsibleUserId,
    isDeleted: false,
    status: { $in: ["assigned", "not_assigned"] },
  })
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  const result = await Promise.all(
    items.map(async (item) => {
      const [report, device, assignedUser, unitResponsibleUser] =
        await Promise.all([
          ReportModel.findOne({
            deviceNumber: item.deviceNumber,
            reportDate,
          })
            .lean()
            .exec(),

          DeviceModel.findOne({
            deviceNumber: item.deviceNumber,
            isActive: true,
          })
            .lean()
            .exec(),

          item.assignedToUserId
            ? UserModel.findOne({
                personalNumber: item.assignedToUserId,
                isActive: true,
              })
                .lean()
                .exec()
            : null,

          UserModel.findOne({
            personalNumber: item.unitResponsibleUserId,
            isActive: true,
          })
            .lean()
            .exec(),
        ]);

      return {
        inventoryItemId: item._id,
        deviceNumber: item.deviceNumber,
        deviceName: device?.deviceName ?? null,
        unit: item.unit,
        inventoryStatus: item.status,
        assignedUser: item.assignedToUserId
          ? {
              personalNumber: item.assignedToUserId,
              fullName: assignedUser?.fullName ?? null,
              phone: assignedUser?.phone ?? null,
            }
          : null,
        unitResponsibleUser: {
          personalNumber: item.unitResponsibleUserId,
          fullName: unitResponsibleUser?.fullName ?? null,
          phone: unitResponsibleUser?.phone ?? null,
        },
        reportDate,
        dailyReportStatus: report?.status ?? "not_reported",
        reportId: report?._id ?? null,
        lastReportDate: item.lastReportDate ?? null,
        lastReportStatus: item.lastReportStatus ?? null,
        lastReportedByUserId: item.lastReportedByUserId ?? null,
        canUnitResponsibleReport: true,
      };
    }),
  );

  return result;
}

async function addInventoryItem(item: IInventoryItem): Promise<IInventoryItem> {
  const existingDevice = await DeviceModel.findOne({
    deviceNumber: item.deviceNumber,
    isActive: true,
  }).exec();

  if (!existingDevice) {
    throw new ClientError(404, "Device number does not exist");
  }

  const responsibleUser = await UserModel.findOne({
    personalNumber: item.unitResponsibleUserId,
    isActive: true,
  }).exec();

  if (!responsibleUser) {
    throw new ClientError(404, "Unit responsible user does not exist");
  }

  if (item.status === "assigned") {
    const assignedUser = await UserModel.findOne({
      personalNumber: item.assignedToUserId,
      isActive: true,
    }).exec();

    if (!assignedUser) {
      throw new ClientError(404, "Assigned user does not exist");
    }

    if (!item.signedAt) {
      throw new ClientError(
        400,
        "Signed date is required when item status is assigned",
      );
    }
  }

  if (item.status === "not_assigned") {
    item.assignedToUserId = null;
    item.signedAt = null;
  }

  const existingSheetDevice = await InventoryItemModel.findOne({
    sheetId: item.sheetId,
    deviceNumber: item.deviceNumber,
  }).exec();

  if (existingSheetDevice) {
    throw new ClientError(
      400,
      "Inventory item already exists for this sheet and device number",
    );
  }

  return InventoryItemModel.create(item);
}

async function updateInventoryItem(
  id: string,
  item: Partial<IInventoryItem>,
): Promise<IInventoryItem | null> {
  const currentItem = await InventoryItemModel.findById(id).exec();

  if (!currentItem) {
    return null;
  }

  if (item.deviceNumber) {
    const existingDevice = await DeviceModel.findOne({
      deviceNumber: item.deviceNumber,
      isActive: true,
    }).exec();

    if (!existingDevice) {
      throw new ClientError(404, "Device number does not exist");
    }
  }

  let unitChanged = false;
  let nextUnit = currentItem.unit;

  if (item.unit !== undefined) {
    nextUnit = String(item.unit).trim();

    if (!nextUnit) {
      throw new ClientError(400, "Unit is required");
    }

    unitChanged = nextUnit !== currentItem.unit;

    if (nextUnit === "מחסן") {
      item.unitResponsibleUserId = "00000";
    } else {
      const responsibleUser = await UserModel.findOne({
        unit: nextUnit,
        isActive: true,
        role: "mashkash",
      }).exec();

      if (!responsibleUser) {
        throw new ClientError(
          404,
          "No active unit responsible user found for this unit",
        );
      }

      item.unitResponsibleUserId = responsibleUser.personalNumber;
    }

    item.assignedToUserId = null;
    item.signedAt = null;
    item.status = "not_assigned";
  }

  if (item.unitResponsibleUserId && item.unitResponsibleUserId !== "00000") {
    const responsibleUser = await UserModel.findOne({
      personalNumber: item.unitResponsibleUserId,
      isActive: true,
    }).exec();

    if (!responsibleUser) {
      throw new ClientError(404, "Unit responsible user does not exist");
    }
  }

  const isOnlyUnitUpdate =
    item.unit !== undefined &&
    item.status === "not_assigned" &&
    item.assignedToUserId === null &&
    item.signedAt === null &&
    item.deviceNumber === undefined;

  const updatedStatus = item.status ?? currentItem.status;

  if (!isOnlyUnitUpdate && updatedStatus === "assigned") {
    const assignedUserId =
      item.assignedToUserId ?? currentItem.assignedToUserId;
    const signedAt = item.signedAt ?? currentItem.signedAt;

    if (!assignedUserId) {
      throw new ClientError(
        400,
        "Assigned user ID is required when status is assigned",
      );
    }

    const assignedUser = await UserModel.findOne({
      personalNumber: assignedUserId,
      isActive: true,
    }).exec();

    if (!assignedUser) {
      throw new ClientError(404, "Assigned user does not exist");
    }

    if (!signedAt) {
      throw new ClientError(
        400,
        "Signed date is required when status is assigned",
      );
    }
  }

  if (!isOnlyUnitUpdate && updatedStatus === "not_assigned") {
    item.assignedToUserId = null;
    item.signedAt = null;
  }

  const updatedDeviceNumber = item.deviceNumber ?? currentItem.deviceNumber;

  const duplicateItem = await InventoryItemModel.findOne({
    _id: { $ne: id },
    sheetId: currentItem.sheetId,
    deviceNumber: updatedDeviceNumber,
  }).exec();

  if (duplicateItem) {
    throw new ClientError(
      400,
      "Inventory item already exists for this sheet and device number",
    );
  }

  const updatedItem = await InventoryItemModel.findByIdAndUpdate(id, item, {
    new: true,
    runValidators: true,
  }).exec();

  if (!updatedItem) {
    return null;
  }

  if (unitChanged) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    await DailyReportModel.updateMany(
      {
        sheetId: currentItem.sheetId,
        deviceNumber: currentItem.deviceNumber,
        reportDate: { $gte: todayStr },
      },
      {
        $set: {
          unit: nextUnit,
          unitResponsibleUserId:
            item.unitResponsibleUserId ?? currentItem.unitResponsibleUserId,
          assignedToUserId: null,
        },
      },
    ).exec();
  }

  return updatedItem;
}

async function returnInventoryItem(
  id: string,
  returnedAt?: Date,
): Promise<IInventoryItem | null> {
  const currentItem = await InventoryItemModel.findOne({
    _id: id,
    isDeleted: false,
  }).exec();

  if (!currentItem) {
    return null;
  }

  return InventoryItemModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    {
      status: "returned",
      returnedAt: returnedAt ?? new Date(),
    },
    { new: true, runValidators: true },
  ).exec();
}

async function updateLastReportStatus(
  id: string,
  reportDate: string,
  reportStatus: "reported" | "not_reported",
  reportedByUserId?: string | null,
): Promise<IInventoryItem | null> {
  return InventoryItemModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    {
      lastReportDate: reportDate,
      lastReportStatus: reportStatus,
      lastReportedByUserId: reportedByUserId ?? null,
    },
    { new: true, runValidators: true },
  ).exec();
}

async function softDeleteInventoryItem(
  id: string,
): Promise<IInventoryItem | null> {
  return InventoryItemModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true },
  ).exec();
}

async function getDailyInventoryStatusByAssignedToUserId(
  assignedToUserId: string,
  reportDate: string,
): Promise<any[]> {
  const items = await InventoryItemModel.find({
    assignedToUserId,
    isDeleted: false,
    status: "assigned",
  })
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  const result = await Promise.all(
    items.map(async (item) => {
      const [report, device, assignedUser, unitResponsibleUser] =
        await Promise.all([
          ReportModel.findOne({
            deviceNumber: item.deviceNumber,
            reportDate,
          })
            .lean()
            .exec(),

          DeviceModel.findOne({
            deviceNumber: item.deviceNumber,
            isActive: true,
          })
            .lean()
            .exec(),

          UserModel.findOne({
            personalNumber: item.assignedToUserId,
            isActive: true,
          })
            .lean()
            .exec(),

          UserModel.findOne({
            personalNumber: item.unitResponsibleUserId,
            isActive: true,
          })
            .lean()
            .exec(),
        ]);

      return {
        inventoryItemId: item._id,
        sheetId: item.sheetId,
        deviceNumber: item.deviceNumber,
        deviceName: device?.deviceName ?? null,
        unit: item.unit,
        inventoryStatus: item.status,
        assignedUser: {
          personalNumber: item.assignedToUserId,
          fullName: assignedUser?.fullName ?? null,
          phone: assignedUser?.phone ?? null,
        },
        unitResponsibleUser: {
          personalNumber: item.unitResponsibleUserId,
          fullName: unitResponsibleUser?.fullName ?? null,
          phone: unitResponsibleUser?.phone ?? null,
        },
        reportDate,
        dailyReportStatus: report?.status ?? "not_reported",
        reportId: report?._id ?? null,
        location: report?.location ?? null,
        notes: report?.notes ?? null,
        lastReportDate: item.lastReportDate ?? null,
        lastReportStatus: item.lastReportStatus ?? null,
        lastReportedByUserId: item.lastReportedByUserId ?? null,
      };
    }),
  );

  return result;
}

export default {
  getAllInventoryItems,
  getInventoryItemById,
  getInventoryItemsBySheetId,
  getInventoryItemsByDeviceNumber,
  getInventoryItemsByAssignedToUserId,
  getInventoryItemsByUnitResponsibleUserId,
  getInventoryItemsByUnit,
  getInventoryItemsByStatus,
  getActiveAssignedInventoryItemForUserAndDevice,
  getDailyInventoryStatus,
  getDailyInventoryStatusByUnitResponsibleUserId,
  getDailyInventoryStatusByAssignedToUserId,
  addInventoryItem,
  updateInventoryItem,
  returnInventoryItem,
  updateLastReportStatus,
  softDeleteInventoryItem,
};
