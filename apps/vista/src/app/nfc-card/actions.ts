"use server";

import dbConnect from "@/lib/db";
import Card, { ICard } from "@/models/Card";
import MessageLog from "@/models/MessageLog";
import { getSession } from "@/lib/auth";
import { normalizePhoneNumber } from "@/lib/whatsapp";
import { Client } from "@upstash/qstash";
import { nanoid } from "nanoid";

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
  scanHistory?: { timestamp: string }[];
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

        scanHistory: card.scanHistory?.map((entry) => ({
          timestamp: new Date(entry.timestamp).toISOString(),
        })),
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

    const { scanHistory, ...restData } = data;
    const newCard = await Card.create({
      ...restData,
      scanHistory: scanHistory?.map(s => ({ timestamp: new Date(s.timestamp) })),
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

        scanHistory: newCard.scanHistory?.map((entry) => ({
          timestamp: new Date(entry.timestamp).toISOString(),
        })),
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

    const { scanHistory, ...restData } = data;
    const updatedCard = (await Card.findOneAndUpdate(
      { uuid: data.uuid },
      {
        ...restData,
        scanHistory: scanHistory?.map(s => ({ timestamp: new Date(s.timestamp) })),
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

        scanHistory: updatedCard.scanHistory?.map((entry) => ({
          timestamp: new Date(entry.timestamp).toISOString(),
        })),
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
        scanHistory: card.scanHistory?.map((entry) => ({
          timestamp: new Date(entry.timestamp).toISOString(),
        })),
      })),
    };
  } catch (error) {
    console.error("Error fetching cards:", error);
    return { success: false, error: "Failed to fetch cards" };
  }
}

// ─── Bulk WhatsApp Messaging ──────────────────────────────────────────────────

export type BulkWhatsAppResponse = {
  success: boolean;
  jobId?: string;
  totalQueued?: number;
  skippedUsers?: { uuid: string; firstName: string; lastName: string; reason: string }[];
  error?: string;
};

/**
 * Dispatches a bulk WhatsApp messaging job.
 * Validates phone numbers, creates MessageLog entries, and enqueues the job via QStash.
 * The `mediaUrl` is an already-uploaded Cloudinary public URL passed from the frontend.
 */
export async function dispatchBulkWhatsAppJob(
  uuids: string[],
  templateName: string,
  templateVariables: string[],
  mediaUrl?: string,
): Promise<BulkWhatsAppResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  if (!uuids.length || !templateName) {
    return { success: false, error: "Missing required fields" };
  }

  try {
    await dbConnect();

    // Fetch all cards for the selected UUIDs
    const cards = (await Card.find({ uuid: { $in: uuids } }).lean()) as unknown as ICard[];

    // Validate phone numbers and split into valid/skipped
    const validRecipients: { uuid: string; phone: string }[] = [];
    const skippedUsers: { uuid: string; firstName: string; lastName: string; reason: string }[] = [];

    for (const card of cards) {
      const normalized = normalizePhoneNumber(card.phone);
      if (normalized) {
        validRecipients.push({ uuid: card.uuid, phone: normalized });
      } else {
        skippedUsers.push({
          uuid: card.uuid,
          firstName: card.firstName,
          lastName: card.lastName,
          reason: card.phone ? "Invalid phone number format" : "No phone number",
        });
      }
    }

    // Also mark UUIDs that weren't found in the database
    const foundUuids = new Set(cards.map((c) => c.uuid));
    for (const uuid of uuids) {
      if (!foundUuids.has(uuid)) {
        skippedUsers.push({
          uuid,
          firstName: "Unknown",
          lastName: "User",
          reason: "Card not found in database",
        });
      }
    }

    if (validRecipients.length === 0) {
      return {
        success: false,
        error: "No valid recipients — all selected users have missing or invalid phone numbers",
        skippedUsers,
      };
    }

    // Generate a unique job ID
    const jobId = nanoid(12);

    // Create MessageLog entries for each valid recipient
    const logEntries = validRecipients.map((r) => ({
      jobId,
      uuid: r.uuid,
      phone: r.phone,
      templateName,
      templateVariables,
      mediaUrl,
      status: "queued" as const,
    }));

    await MessageLog.insertMany(logEntries);

    // Dispatch to QStash
    const qstashClient = new Client({
      token: process.env.UPSTASH_QSTASH_TOKEN!,
    });

    // Determine the base URL for QStash to call back
    const baseUrl = 
      process.env.NEXT_PUBLIC_APP_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
    
    if (!baseUrl) {
      return {
        success: false,
        error: "NEXT_PUBLIC_APP_URL must be set for local development (use ngrok URL)",
      };
    }

    await qstashClient.publishJSON({
      url: `${baseUrl}/api/queue/bulk-whatsapp`,
      body: {
        jobId,
        uuids: validRecipients.map((r) => r.uuid),
        templateName,
        templateVariables,
        mediaUrl,
      },
      retries: 3,
    });

    return {
      success: true,
      jobId,
      totalQueued: validRecipients.length,
      skippedUsers: skippedUsers.length > 0 ? skippedUsers : undefined,
    };
  } catch (error) {
    console.error("Error dispatching bulk WhatsApp job:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to dispatch messaging job";
    return { success: false, error: `Failed to dispatch: ${errorMessage}` };
  }
}
