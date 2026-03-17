import InventoryItemModel, { IInventoryItem } from "../4-models/inventory-item-model";
import UserModel from "../4-models/user-model";
import DeviceModel from "../4-models/device-model";

async function getAllInventoryItems(): Promise<IInventoryItem[]> {
    return InventoryItemModel.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .exec();
}

async function getInventoryItemById(id: string): Promise<IInventoryItem | null> {
    return InventoryItemModel.findOne({ _id: id, isDeleted: false }).exec();
}

async function getInventoryItemsBySheetId(sheetId: string): Promise<IInventoryItem[]> {
    return InventoryItemModel.find({ sheetId, isDeleted: false })
        .sort({ createdAt: -1 })
        .exec();
}

async function getInventoryItemsByDeviceNumber(deviceNumber: string): Promise<IInventoryItem[]> {
    return InventoryItemModel.find({ deviceNumber, isDeleted: false })
        .sort({ createdAt: -1 })
        .exec();
}

async function getInventoryItemsByAssignedToUserId(assignedToUserId: string): Promise<IInventoryItem[]> {
    return InventoryItemModel.find({ assignedToUserId, isDeleted: false })
        .sort({ createdAt: -1 })
        .exec();
}

async function getInventoryItemsByUnitResponsibleUserId(unitResponsibleUserId: string): Promise<IInventoryItem[]> {
    return InventoryItemModel.find({ unitResponsibleUserId, isDeleted: false })
        .sort({ createdAt: -1 })
        .exec();
}

async function getInventoryItemsByUnit(unit: string): Promise<IInventoryItem[]> {
    return InventoryItemModel.find({ unit, isDeleted: false })
        .sort({ createdAt: -1 })
        .exec();
}

async function getInventoryItemsByStatus(status: string): Promise<IInventoryItem[]> {
    return InventoryItemModel.find({ status, isDeleted: false })
        .sort({ createdAt: -1 })
        .exec();
}

async function getActiveAssignedInventoryItemForUserAndDevice(
    assignedToUserId: string,
    deviceNumber: string
): Promise<IInventoryItem | null> {
    return InventoryItemModel.findOne({
        assignedToUserId,
        deviceNumber,
        status: "assigned",
        isDeleted: false
    }).exec();
}

async function addInventoryItem(item: IInventoryItem): Promise<IInventoryItem> {
    const existingDevice = await DeviceModel.findOne({
        deviceNumber: item.deviceNumber,
        isActive: true
    }).exec();

    if (!existingDevice) {
        throw new Error("Device number does not exist");
    }

    const assignedUser = await UserModel.findOne({
        personalNumber: item.assignedToUserId,
        isActive: true
    }).exec();

    if (!assignedUser) {
        throw new Error("Assigned user does not exist");
    }

    const responsibleUser = await UserModel.findOne({
        personalNumber: item.unitResponsibleUserId,
        isActive: true
    }).exec();

    if (!responsibleUser) {
        throw new Error("Unit responsible user does not exist");
    }

    const existingSheetDevice = await InventoryItemModel.findOne({
        sheetId: item.sheetId,
        deviceNumber: item.deviceNumber
    }).exec();

    if (existingSheetDevice) {
        throw new Error("Inventory item already exists for this sheet and device number");
    }

    return InventoryItemModel.create(item);
}

async function updateInventoryItem(id: string, item: Partial<IInventoryItem>): Promise<IInventoryItem | null> {
    const currentItem = await InventoryItemModel.findOne({ _id: id, isDeleted: false }).exec();

    if (!currentItem) {
        return null;
    }

    if (item.deviceNumber) {
        const existingDevice = await DeviceModel.findOne({
            deviceNumber: item.deviceNumber,
            isActive: true
        }).exec();

        if (!existingDevice) {
            throw new Error("Device number does not exist");
        }
    }

    if (item.assignedToUserId) {
        const assignedUser = await UserModel.findOne({
            personalNumber: item.assignedToUserId,
            isActive: true
        }).exec();

        if (!assignedUser) {
            throw new Error("Assigned user does not exist");
        }
    }

    if (item.unitResponsibleUserId) {
        const responsibleUser = await UserModel.findOne({
            personalNumber: item.unitResponsibleUserId,
            isActive: true
        }).exec();

        if (!responsibleUser) {
            throw new Error("Unit responsible user does not exist");
        }
    }

    const updatedSheetId = item.sheetId ?? currentItem.sheetId;
    const updatedDeviceNumber = item.deviceNumber ?? currentItem.deviceNumber;

    const duplicateItem = await InventoryItemModel.findOne({
        _id: { $ne: id },
        sheetId: updatedSheetId,
        deviceNumber: updatedDeviceNumber
    }).exec();

    if (duplicateItem) {
        throw new Error("Inventory item already exists for this sheet and device number");
    }

    return InventoryItemModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        item,
        { new: true, runValidators: true }
    ).exec();
}

async function returnInventoryItem(id: string, returnedAt?: Date): Promise<IInventoryItem | null> {
    const currentItem = await InventoryItemModel.findOne({ _id: id, isDeleted: false }).exec();

    if (!currentItem) {
        return null;
    }

    return InventoryItemModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
            status: "returned",
            returnedAt: returnedAt ?? new Date()
        },
        { new: true, runValidators: true }
    ).exec();
}

async function updateLastReportStatus(
    id: string,
    reportDate: string,
    reportStatus: "reported" | "not_reported",
    reportedByUserId?: string | null
): Promise<IInventoryItem | null> {
    return InventoryItemModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
            lastReportDate: reportDate,
            lastReportStatus: reportStatus,
            lastReportedByUserId: reportedByUserId ?? null
        },
        { new: true, runValidators: true }
    ).exec();
}

async function softDeleteInventoryItem(id: string): Promise<IInventoryItem | null> {
    return InventoryItemModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true }
    ).exec();
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
    addInventoryItem,
    updateInventoryItem,
    returnInventoryItem,
    updateLastReportStatus,
    softDeleteInventoryItem
};