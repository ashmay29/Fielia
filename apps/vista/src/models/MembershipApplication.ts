import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMembershipApplication extends Document {
  fullName: string;
  email: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const MembershipApplicationSchema: Schema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide your full name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email address"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    reason: {
      type: String,
      required: [true, "Please tell us why you are interested"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Prevent overwrite on hot reload
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.MembershipApplication;
}

const MembershipApplication: Model<IMembershipApplication> =
  mongoose.models.MembershipApplication ||
  mongoose.model<IMembershipApplication>(
    "MembershipApplication",
    MembershipApplicationSchema
  );

export default MembershipApplication;
