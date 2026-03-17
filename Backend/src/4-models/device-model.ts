import { Document, Schema, model } from "mongoose";

export interface IDevice extends Document {
    deviceNumber: string;
    deviceName: string;
    isActive: boolean;
    createdAt: Date;
}

const DeviceSchema = new Schema<IDevice>(
    {
        deviceNumber: {
            type: String,
            required: [true, "Device number is required"],
            unique: true,
            trim: true
        },
        deviceName: {
            type: String,
            required: [true, "Device name is required"],
            trim: true
        },
        isActive: {
            type: Boolean,
            required: true,
            default: true
        },
        createdAt: {
            type: Date,
            required: true,
            default: Date.now
        }
    },
    {
        versionKey: false,
        collection: "devices"
    }
);

DeviceSchema.index({ deviceNumber: 1 }, { unique: true });
DeviceSchema.index({ createdAt: 1 });
DeviceSchema.index({ deviceName: 1 });
DeviceSchema.index({ isActive: 1 });

const DeviceModel = model<IDevice>("DeviceModel", DeviceSchema);

export default DeviceModel;