import { Document, Schema, model } from "mongoose";

export interface IDevice extends Document {
    deviceNumber: string;
    deviceName: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const DeviceSchema = new Schema<IDevice>(
    {
        deviceNumber: {
            type: String,
            required: [true, "Device number is required"],
            unique: true,
            trim: true,
            match: [/^\d+$/, "Device number must contain digits only"]
        },
        deviceName: {
            type: String,
            required: [true, "Device name is required"],
            trim: true,
            minlength: [1, "Device name cannot be empty"],
            maxlength: [100, "Device name is too long"]
        },
        isActive: {
            type: Boolean,
            required: true,
            default: true
        }
    },
    {
        versionKey: false,
        collection: "devices",
        timestamps: true
    }
);

// Indexes
DeviceSchema.index({ deviceNumber: 1 }, { unique: true });
DeviceSchema.index({ deviceName: 1 });
DeviceSchema.index({ isActive: 1 });
DeviceSchema.index({ createdAt: -1 });

export default model<IDevice>("DeviceModel", DeviceSchema);