import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICard extends Document {
  uuid: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  preference: string;
  content?: string; // Kept for backward compatibility or generic use
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema: Schema = new Schema(
  {
    uuid: {
      type: String,
      required: [true, "Please provide a UUID"],
      unique: true,
      index: true,
    },
    firstName: {
      type: String,
      required: [true, "Please provide a first name"],
    },
    lastName: {
      type: String,
      required: [true, "Please provide a last name"],
    },
    phone: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    preference: {
      type: String,
      required: false,
      default: "",
    },
    content: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// Prevent overwrite on hot reload
// In development, we force delete the model to ensure schema changes are picked up
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Card;
}

const Card: Model<ICard> =
  mongoose.models.Card || mongoose.model<ICard>("Card", CardSchema);

export default Card;
