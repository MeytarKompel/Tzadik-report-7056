import { Document, Schema, model } from "mongoose";

export type DailyStatus = "reported" | "not_reported";

export interface IDailyReport extends Document {
    sheetId: string;
    deviceNumber: string;
    reportDate: string;

    unit: string;
    assignedToUserId: string;
    unitResponsibleUserId: string;

    status: DailyStatus;

    location?: string;
    reportedBy?: string;

    createdAt: Date;
}

const DailyReportSchema = new Schema<IDailyReport>(
    {
        sheetId: { type: String, required: true },
        deviceNumber: { type: String, required: true },

        reportDate: { type: String, required: true },

        unit: { type: String, required: true },
        assignedToUserId: { type: String, required: true },
        unitResponsibleUserId: { type: String, required: true },

        status: {
            type: String,
            enum: ["reported", "not_reported"],
            default: "not_reported"
        },

        location: String,
        reportedBy: String,

        createdAt: { type: Date, default: Date.now }
    },
    {
        versionKey: false,
        collection: "daily_reports"
    }
);

DailyReportSchema.index(
    { deviceNumber: 1, reportDate: 1 },
    { unique: true }
);

DailyReportSchema.index({ reportDate: 1 });
DailyReportSchema.index({ sheetId: 1 });

export default model<IDailyReport>("DailyReportModel", DailyReportSchema);