import { Schema, model } from "mongoose";

export type InventorySheetStatus = "active" | "closed";

export interface IInventorySheet {
    sheetName: string;
    description?: string;
    createdByUserId: string;
    status: InventorySheetStatus;
    createdAt: Date;
    updatedAt: Date;
}

const InventorySheetSchema = new Schema<IInventorySheet>(
    {
        sheetName: {
            type: String,
            required: [true, "Sheet name is required"],
            trim: true,
            minlength: [2, "Sheet name is too short"],
            maxlength: [200, "Sheet name is too long"]
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        createdByUserId: {
            type: String,
            required: [true, "Created by user ID is required"],
            trim: true,
            match: [/^\d+$/, "Created by user ID must contain digits only"]
        },
        status: {
            type: String,
            required: [true, "Status is required"],
            enum: {
                values: ["active", "closed"],
                message: "Status must be either 'active' or 'closed'"
            },
            default: "active"
        }
    },
    {
        versionKey: false,
        collection: "inventory_sheets",
        timestamps: true
    }
);

InventorySheetSchema.index({ createdAt: 1 });
InventorySheetSchema.index({ createdByUserId: 1 });
InventorySheetSchema.index({ status: 1 });

export default model<IInventorySheet>("InventorySheetModel", InventorySheetSchema);