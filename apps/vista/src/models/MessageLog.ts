import mongoose, { Schema, Document, Model } from "mongoose";
import type { WhatsAppEndpointMode } from "@/lib/whatsapp";

export interface IMessageLog extends Document {
  jobId: string;
  uuid: string;
  phone: string;
  templateName: string;
  templateVariables: string[];
  mediaUrl?: string;
  endpointRequested?: WhatsAppEndpointMode;
  endpointUsed?: WhatsAppEndpointMode;
  fallbackUsed?: boolean;
  status: "queued" | "sending" | "sent" | "delivered" | "read" | "failed";
  error?: string;
  whatsappMessageId?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageLogSchema: Schema = new Schema(
  {
    jobId: {
      type: String,
      required: true,
      index: true,
    },
    uuid: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    templateName: {
      type: String,
      required: true,
    },
    templateVariables: {
      type: [String],
      default: [],
    },
    mediaUrl: {
      type: String,
      required: false,
    },
    endpointRequested: {
      type: String,
      enum: ["standard", "marketing"],
      required: false,
    },
    endpointUsed: {
      type: String,
      enum: ["standard", "marketing"],
      required: false,
    },
    fallbackUsed: {
      type: Boolean,
      required: false,
    },
    status: {
      type: String,
      enum: ["queued", "sending", "sent", "delivered", "read", "failed"],
      default: "queued",
    },
    error: {
      type: String,
      required: false,
    },
    whatsappMessageId: {
      type: String,
      required: false,
      index: true,
    },
    sentAt: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true },
);

// Compound index for efficient job progress queries
MessageLogSchema.index({ jobId: 1, status: 1 });

// Prevent overwrite on hot reload
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.MessageLog;
}

const MessageLog: Model<IMessageLog> =
  mongoose.models.MessageLog ||
  mongoose.model<IMessageLog>("MessageLog", MessageLogSchema);

export default MessageLog;
