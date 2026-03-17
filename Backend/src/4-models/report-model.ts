import { Document, Schema, model } from "mongoose";

export type ReportStatus = "reported" | "not_reported";

export interface IReport extends Document {
    deviceNumber: string;
    reportDate: string;
    status: ReportStatus;
    reportedBy?: string;
    unit: string;
    location?: string;
    notes?: string;
    createdAt: Date;
}

const ReportSchema = new Schema<IReport>(
    {
        deviceNumber: {
            type: String,
            required: [true, "Device number is required"],
            trim: true
        },
        reportDate: {
            type: String,
            required: [true, "Report date is required"],
            trim: true,
            match: [/^\d{4}-\d{2}-\d{2}$/, "Report date must be in YYYY-MM-DD format"]
        },
        status: {
            type: String,
            required: [true, "Status is required"],
            enum: {
                values: ["reported", "not_reported"],
                message: "Status must be either 'reported' or 'not_reported'"
            },
            default: "not_reported"
        },
        reportedBy: {
            type: String,
            trim: true,
            required: function (this: IReport): boolean {
                return this.status === "reported";
            }
        },
        unit: {
            type: String,
            required: [true, "Unit is required"],
            trim: true
        },
        location: {
            type: String,
            trim: true,
            required: function (this: IReport): boolean {
                return this.status === "reported";
            }
        },
        notes: {
            type: String,
            trim: true,
            default: ""
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        versionKey: false,
        collection: "daily_reports"
    }
);

ReportSchema.index({ deviceNumber: 1, reportDate: 1 }, { unique: true });
ReportSchema.index({ reportDate: 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ unit: 1 });
ReportSchema.index({ deviceNumber: 1 });
ReportSchema.index({ createdAt: -1 });

export default model<IReport>("ReportModel", ReportSchema);