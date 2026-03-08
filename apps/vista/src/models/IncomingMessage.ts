import mongoose, { Schema, Document, Model } from "mongoose";

export interface IIncomingMessage extends Document {
  waMessageId: string;
  fromWaId: string;
  fromProfileName?: string;
  toPhoneNumberId?: string;
  displayPhoneNumber?: string;
  messageType: string;
  textBody?: string;
  receivedAt: Date;
  raw: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const IncomingMessageSchema: Schema = new Schema(
  {
    waMessageId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fromWaId: {
      type: String,
      required: true,
      index: true,
    },
    fromProfileName: {
      type: String,
      required: false,
    },
    toPhoneNumberId: {
      type: String,
      required: false,
    },
    displayPhoneNumber: {
      type: String,
      required: false,
    },
    messageType: {
      type: String,
      required: true,
    },
    textBody: {
      type: String,
      required: false,
    },
    receivedAt: {
      type: Date,
      required: true,
      index: true,
    },
    raw: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true },
);

IncomingMessageSchema.index({ fromWaId: 1, receivedAt: -1 });

if (process.env.NODE_ENV === "development") {
  delete mongoose.models.IncomingMessage;
}

const IncomingMessage: Model<IIncomingMessage> =
  mongoose.models.IncomingMessage ||
  mongoose.model<IIncomingMessage>("IncomingMessage", IncomingMessageSchema);

export default IncomingMessage;
