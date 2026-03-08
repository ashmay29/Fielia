import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MessageLog from "@/models/MessageLog";
import IncomingMessage from "@/models/IncomingMessage";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;

/**
 * GET /api/webhook
 * Handles Meta webhook verification (subscribe handshake).
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[Webhook] Verification successful");
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("[Webhook] Verification failed — token mismatch");
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * POST /api/webhook
 * Receives incoming messages or status updates (delivery/read receipts)
 * from Meta and updates the MessageLog accordingly.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[Webhook] Received POST payload:", JSON.stringify(body, null, 2));

    // Meta sends data in body.entry[].changes[].value
    const entries = body?.entry || [];
    console.log(`[Webhook] Processing ${entries.length} entries`);

    for (const entry of entries) {
      const changes = entry?.changes || [];
      console.log(`[Webhook] Processing ${changes.length} changes`);

      for (const change of changes) {
        const value = change?.value;
        if (!value) {
          console.log("[Webhook] No value in change, skipping");
          continue;
        }

        console.log(`[Webhook] Change field: ${change?.field}`);

        // Process inbound replies from users
        const messages = value?.messages || [];
        console.log(`[Webhook] Found ${messages.length} inbound messages`);

        if (messages.length > 0) {
          await dbConnect();

          const contacts = value?.contacts || [];
          const metadata = value?.metadata || {};
          const contactNameByWaId = new Map<string, string>();

          for (const contact of contacts) {
            const waId = contact?.wa_id;
            const profileName = contact?.profile?.name;
            if (waId && profileName) {
              contactNameByWaId.set(waId, profileName);
            }
          }

          for (const incoming of messages) {
            const waMessageId = incoming?.id;
            const fromWaId = incoming?.from;
            const messageType = incoming?.type || "unknown";
            const textBody = incoming?.text?.body;
            const receivedAt = incoming?.timestamp
              ? new Date(Number(incoming.timestamp) * 1000)
              : new Date();

            if (!waMessageId || !fromWaId) {
              console.warn("[Webhook] Inbound message missing id/from, skipping");
              continue;
            }

            await IncomingMessage.findOneAndUpdate(
              { waMessageId },
              {
                $set: {
                  waMessageId,
                  fromWaId,
                  fromProfileName: contactNameByWaId.get(fromWaId),
                  toPhoneNumberId: metadata?.phone_number_id,
                  displayPhoneNumber: metadata?.display_phone_number,
                  messageType,
                  textBody,
                  receivedAt,
                  raw: incoming,
                },
              },
              { upsert: true, new: true, setDefaultsOnInsert: true },
            );

            console.log(
              `[Webhook] ✅ Tracked inbound message ${waMessageId} from ${fromWaId}`,
            );
          }
        }

        // Process status updates (delivery receipts)
        const statuses = value?.statuses || [];
        console.log(`[Webhook] Found ${statuses.length} status updates`);

        if (statuses.length > 0) {
          await dbConnect();

          for (const statusUpdate of statuses) {
            const whatsappMessageId = statusUpdate?.id;
            const newStatus = statusUpdate?.status; // sent, delivered, read, failed
            const errorInfo = statusUpdate?.errors?.[0];

            console.log(
              `[Webhook] Status update - Message ID: ${whatsappMessageId}, Status: ${newStatus}`,
            );

            if (!whatsappMessageId || !newStatus) {
              console.warn("[Webhook] Missing messageId or status, skipping");
              continue;
            }

            // Map Meta status to our status enum
            const validStatuses = [
              "sent",
              "delivered",
              "read",
              "failed",
            ] as const;
            if (
              !validStatuses.includes(
                newStatus as (typeof validStatuses)[number],
              )
            ) {
              console.warn(`[Webhook] Invalid status: ${newStatus}`);
              continue;
            }

            const updateData: Record<string, unknown> = { status: newStatus };
            if (newStatus === "failed" && errorInfo) {
              updateData.error =
                errorInfo.message ||
                `Error code: ${errorInfo.code || "unknown"}`;
            }

            const result = await MessageLog.findOneAndUpdate(
              { whatsappMessageId },
              { $set: updateData },
              { new: true },
            );

            if (result) {
              console.log(
                `[Webhook] ✅ Updated message ${whatsappMessageId} → ${newStatus}`,
              );
            } else {
              console.warn(
                `[Webhook] ⚠️  No document found for wamid: ${whatsappMessageId}`,
              );
              // Check if this wamid exists at all in the database
              const exists = await MessageLog.findOne({ whatsappMessageId }).select('_id jobId phone status');
              if (exists) {
                console.log(`[Webhook] Found it: ${JSON.stringify(exists)}`);
              } else {
                console.log(`[Webhook] This wamid does not exist in any MessageLog`);
              }
            }
          }
        }
      }
    }

    // Always return 200 to acknowledge receipt — Meta will retry on non-200
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    // Still return 200 to prevent Meta from retrying on processing errors
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }
}
