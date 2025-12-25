import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICard extends Document {
  uuid: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  preference: string;
  content?: string; // Kept for backward compatibility or generic use
}

const CardSchema: Schema = new Schema({
  uuid: {
    type: String,
    required: [true, 'Please provide a UUID'],
    unique: true,
    index: true,
  },
  firstName: {
    type: String,
    required: [true, 'Please provide a first name'],
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a last name'],
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
  },
  address: {
    type: String,
    required: [true, 'Please provide an address'],
  },
  preference: {
    type: String,
    required: [false, 'Preference is optional'], // Making optional as it might not be strictly required? Plan said collect it. I'll make it required if user implied it. User said "Add... preference". I'll make it required to be safe, or default string. Let's make it required as part of the form.
    default: '',
  },
  content: {
    type: String,
    required: false,
  },
}, { timestamps: true });

// Prevent overwrite on hot reload
// In development, we force delete the model to ensure schema changes are picked up
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Card;
}

const Card: Model<ICard> = mongoose.models.Card || mongoose.model<ICard>('Card', CardSchema);

export default Card;
