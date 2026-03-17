import InventorySheetModel, { IInventorySheet } from "../4-models/inventory-sheet-model";
import UserModel from "../4-models/user-model";
import InventoryItemModel from "../4-models/inventory-item-model";

async function getAllInventorySheets(): Promise<IInventorySheet[]> {
    return InventorySheetModel.find().sort({ createdAt: -1 }).exec();
}

async function getInventorySheetById(id: string): Promise<IInventorySheet | null> {
    return InventorySheetModel.findById(id).exec();
}

async function getInventorySheetsByStatus(status: string): Promise<IInventorySheet[]> {
    return InventorySheetModel.find({ status }).sort({ createdAt: -1 }).exec();
}

async function getInventorySheetsByCreatedByUserId(createdByUserId: string): Promise<IInventorySheet[]> {
    return InventorySheetModel.find({ createdByUserId }).sort({ createdAt: -1 }).exec();
}

async function addInventorySheet(sheet: IInventorySheet): Promise<IInventorySheet> {
    const creator = await UserModel.findOne({
        personalNumber: sheet.createdByUserId,
        isActive: true
    }).exec();

    if (!creator) {
        throw new Error("Created by user does not exist");
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
        isActive: true
    }).exec();

    if (!creator) {
        throw new Error("Created by user does not exist");
    }

    if (creator.role !== "admin") {
        throw new Error("Only admin can create a new inventory sheet");
    }

    const today = new Date().toISOString().slice(0, 10);
    const generatedId = `sheet-${today}-${Date.now()}`;

    return InventorySheetModel.create({
        _id: generatedId,
        sheetName: data.sheetName,
        description: data.description ?? "",
        createdByUserId: data.createdByUserId,
        status: "active"
    });
}

async function updateInventorySheet(id: string, sheet: Partial<IInventorySheet>): Promise<IInventorySheet | null> {
    if (sheet.createdByUserId) {
        const creator = await UserModel.findOne({
            personalNumber: sheet.createdByUserId,
            isActive: true
        }).exec();

        if (!creator) {
            throw new Error("Created by user does not exist");
        }
    }

    return InventorySheetModel.findByIdAndUpdate(
        id,
        sheet,
        { new: true, runValidators: true }
    ).exec();
}

async function closeInventorySheet(id: string): Promise<IInventorySheet | null> {
    return InventorySheetModel.findByIdAndUpdate(
        id,
        { status: "closed" },
        { new: true, runValidators: true }
    ).exec();
}

async function reopenInventorySheet(id: string): Promise<IInventorySheet | null> {
    return InventorySheetModel.findByIdAndUpdate(
        id,
        { status: "active" },
        { new: true, runValidators: true }
    ).exec();
}

async function deleteInventorySheet(id: string): Promise<IInventorySheet | null> {
    return InventorySheetModel.findByIdAndDelete(id).exec();
}

async function getInventorySheetWithItems(id: string): Promise<any | null> {
    const sheet = await InventorySheetModel.findById(id).lean().exec();

    if (!sheet) {
        return null;
    }

    const items = await InventoryItemModel.find({
        sheetId: id,
        isDeleted: false
    })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

    return {
        ...sheet,
        items,
        itemsCount: items.length
    };
}

async function addInventoryItemToSheet(
    sheetId: string,
    item: any
): Promise<any> {
    const sheet = await InventorySheetModel.findById(sheetId).exec();

    if (!sheet) {
        throw new Error("Inventory sheet not found");
    }

    if (sheet.status !== "active") {
        throw new Error("Cannot add items to a closed inventory sheet");
    }

    const createdItemId = `${sheetId}_${item.deviceNumber}`;

    const existingItem = await InventoryItemModel.findOne({
        sheetId,
        deviceNumber: item.deviceNumber
    }).exec();

    if (existingItem) {
        throw new Error("Inventory item already exists for this sheet and device number");
    }

    const createdItem = await InventoryItemModel.create({
        ...item,
        _id: createdItemId,
        sheetId
    });

    return createdItem;
}

async function getInventorySheetSummary(id: string): Promise<any | null> {
    const sheet = await InventorySheetModel.findById(id).lean().exec();

    if (!sheet) {
        return null;
    }

    const items = await InventoryItemModel.find({
        sheetId: id,
        isDeleted: false
    }).lean().exec();

    const totalItems = items.length;
    const assignedItems = items.filter(item => item.status === "assigned").length;
    const returnedItems = items.filter(item => item.status === "returned").length;
    const reportedToday = items.filter(item => item.lastReportStatus === "reported").length;
    const notReportedToday = items.filter(item => item.lastReportStatus === "not_reported").length;

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
            reportedToday,
            notReportedToday
        }
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
    getInventorySheetSummary    
};