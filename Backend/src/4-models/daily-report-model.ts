import { Document, Schema, model } from "mongoose";

export type DailyReportStatus = "reported" | "not_reported";

export interface IDailyReport extends Document {
    sheetId: string;
    deviceNumber: string;
    reportDate: string;
    unit: string;
    assignedToUserId?: string | null;
    unitResponsibleUserId: string;
    status: DailyReportStatus;
    location?: string | null;
    reportedBy?: string | null;
    notes?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const DailyReportSchema = new Schema<IDailyReport>(
    {
        sheetId: {
            type: String,
            required: [true, "Sheet ID is required"],
            trim: true
        },
        deviceNumber: {
            type: String,
            required: [true, "Device number is required"],
            trim: true,
            match: [/^\d+$/, "Device number must contain digits only"]
        },
        reportDate: {
            type: String,
            required: [true, "Report date is required"],
            trim: true,
            match: [/^\d{4}-\d{2}-\d{2}$/, "Report date must be in YYYY-MM-DD format"]
        },
        unit: {
            type: String,
            required: [true, "Unit is required"],
            trim: true
        },
        assignedToUserId: {
            type: String,
            trim: true,
            default: null
        },
        unitResponsibleUserId: {
            type: String,
            required: [true, "Unit responsible user ID is required"],
            trim: true,
            match: [/^\d+$/, "Unit responsible user ID must contain digits only"]
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
        location: {
            type: String,
            trim: true,
            default: null
        },
        reportedBy: {
            type: String,
            trim: true,
            default: null,
            match: [/^\d*$/, "Reported by must contain digits only"]
        },
        notes: {
            type: String,
            trim: true,
            default: null
        }
    },
    {
        versionKey: false,
        collection: "daily_reports",
        timestamps: true
    }
);

DailyReportSchema.index({ sheetId: 1 });
DailyReportSchema.index({ reportDate: 1 });
DailyReportSchema.index({ deviceNumber: 1, reportDate: 1 }, { unique: true });
DailyReportSchema.index({ unitResponsibleUserId: 1 });
DailyReportSchema.index({ assignedToUserId: 1 });
DailyReportSchema.index({ status: 1 });

export default model<IDailyReport>("DailyReportModel", DailyReportSchema);