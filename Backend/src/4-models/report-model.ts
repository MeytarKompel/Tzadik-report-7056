import { Document, Schema, model } from "mongoose";

export type ReportStatus = "reported" | "not_reported";

export interface IReport extends Document {
    deviceNumber: string;
    reportDate: string;
    status: ReportStatus;
    reportedBy?: string;
    unit?: string;
    location?: string;
    notes?: string;
    createdAt: Date;
}

const ReportSchema = new Schema<IReport>(
    {
        deviceNumber: {
            type: String,
            required: true,
            trim: true
        },
        reportDate: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            required: true,
            enum: ["reported", "not_reported"],
            default: "not_reported"
        },
        reportedBy: {
            type: String,
            trim: true
        },
        unit: {
            type: String,
            trim: true
        },
        location: {
            type: String,
            trim: true
        },
        notes: {
            type: String,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        versionKey: false,
        collection: "reports"
    }
);

ReportSchema.index({ deviceNumber: 1, reportDate: 1 }, { unique: true });
ReportSchema.index({ reportDate: 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ unit: 1 });

export default model<IReport>("ReportModel", ReportSchema);