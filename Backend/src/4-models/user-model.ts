import { Document, Schema, model } from "mongoose";

export type UserRole = "regular" | "mashkash" | "admin";

export interface IUser extends Document {
  personalNumber: string;
  fullName: string;
  unit: string;
  role: UserRole;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    personalNumber: {
      type: String,
      required: [true, "Personal number is required"],
      unique: true,
      trim: true,
      match: [/^\d+$/, "Personal number must contain digits only"],
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name is too short"],
      maxlength: [100, "Full name is too long"],
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: ["regular", "mashkash", "admin"],
        message: "Invalid user role",
      },
      default: "regular",
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
      set: (value: string) => value.replace(/\D/g, ""), // 🔥 כאן
      match: [/^\d{9,10}$/, "Phone must be 9-10 digits"],
    },
  },
  {
    versionKey: false,
    collection: "users",
    timestamps: true,
  },
);

// Indexes
UserSchema.index({ personalNumber: 1 }, { unique: true });
UserSchema.index({ unit: 1 });
UserSchema.index({ role: 1 });

// חשוב מאוד לזיהוי
UserSchema.index({ personalNumber: 1, phone: 1 }, { unique: true });

export default model<IUser>("UserModel", UserSchema);
