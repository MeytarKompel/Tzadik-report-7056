import { Document, Schema, model } from "mongoose";

export type InventoryItemStatus = "assigned" | "returned" | "not_assigned";
export type InventoryReportStatus = "reported" | "not_reported";

export interface IInventoryItem extends Document {
    _id: string;
    sheetId: string;
    unit: string;
    unitResponsibleUserId: string;
    assignedToUserId?: string | null;
    signedAt?: Date | null;
    returnedAt?: Date | null;
    status: InventoryItemStatus;
    lastReportDate?: string;
    lastReportStatus?: InventoryReportStatus;
    lastReportedByUserId?: string | null;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    deviceNumber: string;
}

const InventoryItemSchema = new Schema<IInventoryItem>(
    {
        _id: {
            type: String,
            required: [true, "Inventory item ID is required"],
            trim: true
        },
        sheetId: {
            type: String,
            required: [true, "Sheet ID is required"],
            trim: true
        },
        unit: {
            type: String,
            required: [true, "Unit is required"],
            trim: true
        },
        unitResponsibleUserId: {
            type: String,
            required: [true, "Unit responsible user ID is required"],
            trim: true,
            match: [/^\d+$/, "Unit responsible user ID must contain digits only"]
        },
        assignedToUserId: {
            type: String,
            trim: true,
            default: null,
            validate: {
                validator: function (this: IInventoryItem, value: string | null): boolean {
                    if (this.status === "assigned") {
                        return !!value && /^\d+$/.test(value);
                    }
                    return value === null || value === undefined || value === "";
                },
                message: "Assigned user ID is required only when status is 'assigned'"
            }
        },
        signedAt: {
            type: Date,
            default: null,
            validate: {
                validator: function (this: IInventoryItem, value: Date | null): boolean {
                    if (this.status === "assigned") {
                        return value instanceof Date;
                    }
                    return value === null || value === undefined;
                },
                message: "Signed date is required only when status is 'assigned'"
            }
        },
        returnedAt: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            required: [true, "Status is required"],
            enum: {
                values: ["assigned", "returned", "not_assigned"],
                message: "Status must be either 'assigned', 'returned' or 'not_assigned'"
            },
            default: "assigned"
        },
        lastReportDate: {
            type: String,
            trim: true,
            match: [/^\d{4}-\d{2}-\d{2}$/, "Last report date must be in YYYY-MM-DD format"]
        },
        lastReportStatus: {
            type: String,
            enum: {
                values: ["reported", "not_reported"],
                message: "Last report status must be either 'reported' or 'not_reported'"
            }
        },
        lastReportedByUserId: {
            type: String,
            trim: true,
            default: null,
            match: [/^\d*$/, "Last reported by user ID must contain digits only"]
        },
        isDeleted: {
            type: Boolean,
            required: true,
            default: false
        },
        deviceNumber: {
            type: String,
            required: [true, "Device number is required"],
            trim: true,
            match: [/^\d+$/, "Device number must contain digits only"]
        }
    },
    {
        versionKey: false,
        collection: "inventory_items",
        timestamps: true
    }
);

InventoryItemSchema.index({ assignedToUserId: 1 });
InventoryItemSchema.index({ isDeleted: 1 });
InventoryItemSchema.index({ lastReportDate: 1 });
InventoryItemSchema.index({ sheetId: 1, deviceNumber: 1 }, { unique: true });
InventoryItemSchema.index({ status: 1 });
InventoryItemSchema.index({ unitResponsibleUserId: 1 });
InventoryItemSchema.index({ unit: 1 });

export default model<IInventoryItem>("InventoryItemModel", InventoryItemSchema);