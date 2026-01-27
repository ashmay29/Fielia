"use server";

import dbConnect from "@/lib/db";
import Card, { ICard } from "@/models/Card";
import { getSession } from "@/lib/auth";

export type CardData = {
  uuid: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  preference: string;
  dob?: string;
  anniversary?: string;
  content?: string;
  createdAt?: string;
  scanHistory?: { timestamp: Date }[];
};

export type CardResponse = {
  success: boolean;
  data?: CardData;
  error?: string;
};

export type AllCardsResponse = {
  success: boolean;
  data?: CardData[];
  error?: string;
};

export async function getCardByUuid(uuid: string): Promise<CardResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  if (!uuid) {
    return { success: false, error: "UUID is required" };
  }

  try {
    await dbConnect();
    // Using findOneAndUpdate to atomically update history and return document
    const card = (await Card.findOneAndUpdate(
      { uuid },
      {
        $push: {
          scanHistory: { timestamp: new Date() },
        },
      },
      { new: true },
    ).lean()) as unknown as ICard;

    if (!card) {
      return { success: false, error: "Card not found" };
    }

    return {
      success: true,
      data: {
        uuid: card.uuid,
        firstName: card.firstName,
        lastName: card.lastName,
        phone: card.phone,

        address: card.address,
        preference: card.preference,
        dob: card.dob?.toISOString().split('T')[0],
        anniversary: card.anniversary?.toISOString().split('T')[0],
        content: card.content,
        createdAt: card.createdAt?.toISOString(),
        scanHistory: card.scanHistory,
      },
    };
  } catch (error) {
    console.error("Error fetching card:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function createCard(data: CardData): Promise<CardResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  if (!data.uuid || !data.firstName || !data.lastName) {
    return { success: false, error: "Missing required fields" };
  }

  try {
    await dbConnect();
    // Check if exists first
    const existing = await Card.findOne({ uuid: data.uuid });
    if (existing) {
      return { success: false, error: "Card already exists" };
    }

    const newCard = await Card.create({
      ...data,
      content: data.content || `${data.firstName} ${data.lastName}`,
    });

    // Explicitly return plain object to avoid serialization errors
    return {
      success: true,
      data: {
        uuid: newCard.uuid,
        firstName: newCard.firstName,
        lastName: newCard.lastName,
        phone: newCard.phone,
        address: newCard.address,
        preference: newCard.preference,
        dob: newCard.dob?.toISOString().split('T')[0],
        anniversary: newCard.anniversary?.toISOString().split('T')[0],
        content: newCard.content,
        createdAt: newCard.createdAt?.toISOString(),
        scanHistory: newCard.scanHistory,
      },
    };
  } catch (error) {
    console.error("Error creating card:", error);
    return { success: false, error: "Failed to register card" };
  }
}

export async function updateCard(data: CardData): Promise<CardResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  if (!data.uuid) {
    return { success: false, error: "UUID is required" };
  }

  try {
    await dbConnect();

    const updatedCard = (await Card.findOneAndUpdate(
      { uuid: data.uuid },
      {
        ...data,
        dob: data.dob ? new Date(data.dob) : undefined,
        anniversary: data.anniversary ? new Date(data.anniversary) : undefined,
        content: data.content || `${data.firstName} ${data.lastName}`,
      },
      { new: true, runValidators: true, lean: true },
    )) as unknown as ICard;

    if (!updatedCard) {
      return { success: false, error: "Card not found" };
    }

    return {
      success: true,
      data: {
        uuid: updatedCard.uuid,
        firstName: updatedCard.firstName,
        lastName: updatedCard.lastName,
        phone: updatedCard.phone,
        address: updatedCard.address,
        preference: updatedCard.preference,
        dob: updatedCard.dob?.toISOString().split('T')[0],
        anniversary: updatedCard.anniversary?.toISOString().split('T')[0],
        content: updatedCard.content,
        createdAt: updatedCard.createdAt?.toISOString(),
        scanHistory: updatedCard.scanHistory,
      },
    };
  } catch (error) {
    console.error("Error updating card:", error);
    return { success: false, error: "Failed to update card" };
  }
}

export async function deleteCard(uuid: string): Promise<CardResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  if (!uuid) {
    return { success: false, error: "UUID is required" };
  }

  try {
    await dbConnect();

    const deletedCard = await Card.findOneAndDelete({ uuid });

    if (!deletedCard) {
      return { success: false, error: "Card not found" };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting card:", error);
    return { success: false, error: "Failed to delete card" };
  }
}

export async function getAllCards(): Promise<AllCardsResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    const cards = (await Card.find({})
      .sort({ createdAt: -1 })
      .lean()) as unknown as ICard[];

    return {
      success: true,
      data: cards.map((card) => ({
        uuid: card.uuid,
        firstName: card.firstName,
        lastName: card.lastName,
        phone: card.phone,
        address: card.address,
        preference: card.preference,
        content: card.content,
        createdAt: card.createdAt?.toISOString(),
        scanHistory: card.scanHistory,
      })),
    };
  } catch (error) {
    console.error("Error fetching cards:", error);
    return { success: false, error: "Failed to fetch cards" };
  }
}
