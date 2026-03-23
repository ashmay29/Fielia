import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import dbConnect from "@/lib/db";
import Card from "@/models/Card";
import MessageLog from "@/models/MessageLog";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";
import type { WhatsAppEndpointMode } from "@/lib/whatsapp";

const receiver = new Receiver({
  currentSigningKey: process.env.UPSTASH_QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.UPSTASH_QSTASH_NEXT_SIGNING_KEY!,
});

// Configuration
const BATCH_SIZE = 50;
const INTER_MESSAGE_DELAY_MS = Math.max(
  0,
  Number(process.env.WHATSAPP_INTER_MESSAGE_DELAY_MS || "150"),
);
const INTER_BATCH_DELAY_MS = Math.max(
  0,
  Number(process.env.WHATSAPP_INTER_BATCH_DELAY_MS || "1000"),
);
const SENDING_STALE_AFTER_MS = Math.max(
  60_000,
  Number(process.env.WHATSAPP_SENDING_STALE_AFTER_MS || "600000"),
);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * POST /api/queue/bulk-whatsapp
 * QStash consumer endpoint that processes bulk WhatsApp messaging jobs.
 * Verifies QStash signature for security.
 */
export async function POST(request: NextRequest) {
  // Verify QStash signature
  const signature = request.headers.get("upstash-signature");
  const body = await request.text();

  // In development, skip signature verification if no signing keys configured
  const isDev = process.env.NODE_ENV === "development";
  if (!isDev) {
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    try {
      const isValid = await receiver.verify({
        signature,
        body,
      });

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 },
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Signature verification failed" },
        { status: 401 },
      );
    }
  }

  try {
    const payload = JSON.parse(body);
    const {
      jobId,
      uuids,
      templateName,
      templateVariables,
      mediaUrl,
      endpointMode,
    }: {
      jobId: string;
      uuids: string[];
      templateName: string;
      templateVariables: string[];
      mediaUrl?: string;
      endpointMode?: WhatsAppEndpointMode;
    } = payload;

    const requestedEndpoint: WhatsAppEndpointMode = endpointMode || "marketing";

    if (!jobId || !uuids?.length || !templateName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Fetch phone numbers for all uuids
    const cards = await Card.find({ uuid: { $in: uuids } })
      .select("uuid phone")
      .lean();

    const cardMap = new Map(
      cards.map((c: any) => [c.uuid, c.phone as string]),
    );

    const staleSendingBefore = new Date(Date.now() - SENDING_STALE_AFTER_MS);

    // Process in batches with throttling to avoid API burst failures.
    for (let i = 0; i < uuids.length; i += BATCH_SIZE) {
      const batch = uuids.slice(i, i + BATCH_SIZE);

      for (let batchIndex = 0; batchIndex < batch.length; batchIndex++) {
        const uuid = batch[batchIndex];

        // Idempotency guard: atomically claim a recipient before sending so queue
        // redeliveries cannot send the same recipient twice for the same job.
        const claimedLog = await MessageLog.findOneAndUpdate(
          {
            jobId,
            uuid,
            $or: [
              { status: "queued" },
              { status: "sending", updatedAt: { $lt: staleSendingBefore } },
            ],
          },
          {
            $set: {
              status: "sending",
              endpointRequested: requestedEndpoint,
              updatedAt: new Date(),
            },
            $unset: {
              error: "",
            },
          },
          { new: true },
        ).lean();

        if (!claimedLog) {
          continue;
        }

        const phone = cardMap.get(uuid) || claimedLog.phone;

        if (!phone) {
          // This shouldn't happen since we pre-validated, but handle gracefully
          await MessageLog.findOneAndUpdate(
            { jobId, uuid },
            {
              $set: {
                status: "failed",
                error: "Phone number not found in database",
              },
            },
          );
          continue;
        }

        try {
          const result = await sendWhatsAppTemplate(
            phone,
            templateName,
            templateVariables,
            mediaUrl,
            {
              endpointMode: requestedEndpoint,
              allowFallbackToStandard: true,
              logContext: {
                jobId,
                uuid,
              },
            },
          );

          if (result.success) {
            await MessageLog.findOneAndUpdate(
              { jobId, uuid },
              {
                $set: {
                  status: "sent",
                  whatsappMessageId: result.whatsappMessageId,
                  endpointRequested: result.endpointRequested || requestedEndpoint,
                  endpointUsed: result.endpointUsed || requestedEndpoint,
                  fallbackUsed: result.fallbackUsed || false,
                  sentAt: new Date(),
                },
              },
            );
          } else {
            // Check for rate limiting
            if (result.error?.includes("429") || result.error?.includes("rate")) {
              // Wait longer before continuing
              console.warn(
                `[BulkWA] Rate limited on ${uuid}, waiting 60s...`,
              );
              await sleep(60_000);

              // Retry once
              const retry = await sendWhatsAppTemplate(
                phone,
                templateName,
                templateVariables,
                mediaUrl,
                {
                  endpointMode: requestedEndpoint,
                  allowFallbackToStandard: true,
                  logContext: {
                    jobId,
                    uuid,
                    retryAfterRateLimit: true,
                  },
                },
              );

              if (retry.success) {
                await MessageLog.findOneAndUpdate(
                  { jobId, uuid },
                  {
                    $set: {
                      status: "sent",
                      whatsappMessageId: retry.whatsappMessageId,
                      endpointRequested: retry.endpointRequested || requestedEndpoint,
                      endpointUsed: retry.endpointUsed || requestedEndpoint,
                      fallbackUsed: retry.fallbackUsed || false,
                      sentAt: new Date(),
                    },
                  },
                );
              } else {
                await MessageLog.findOneAndUpdate(
                  { jobId, uuid },
                  {
                    $set: {
                      status: "failed",
                      endpointRequested: retry.endpointRequested || requestedEndpoint,
                      endpointUsed: retry.endpointUsed || requestedEndpoint,
                      fallbackUsed: retry.fallbackUsed || false,
                      error: retry.error || "Failed after rate-limit retry",
                    },
                  },
                );
              }
            } else {
              await MessageLog.findOneAndUpdate(
                { jobId, uuid },
                {
                  $set: {
                    status: "failed",
                    endpointRequested: result.endpointRequested || requestedEndpoint,
                    endpointUsed: result.endpointUsed || requestedEndpoint,
                    fallbackUsed: result.fallbackUsed || false,
                    error: result.error || "Unknown send error",
                  },
                },
              );
            }
          }
        } catch (err: any) {
          await MessageLog.findOneAndUpdate(
            { jobId, uuid },
            {
              $set: {
                status: "failed",
                endpointRequested: requestedEndpoint,
                error: err.message || "Unexpected error",
              },
            },
          );
        }

        // Throttle between messages.
        const globalIndex = i + batchIndex;
        if (globalIndex < uuids.length - 1) {
          await sleep(INTER_MESSAGE_DELAY_MS);
        }
      }

      // Add a brief pause between batches to smooth out traffic spikes.
      const hasMoreBatches = i + BATCH_SIZE < uuids.length;
      if (hasMoreBatches && INTER_BATCH_DELAY_MS > 0) {
        await sleep(INTER_BATCH_DELAY_MS);
      }
    }

    const endpointStats = await MessageLog.aggregate([
      { $match: { jobId } },
      {
        $group: {
          _id: {
            endpointRequested: "$endpointRequested",
            endpointUsed: "$endpointUsed",
            status: "$status",
            fallbackUsed: "$fallbackUsed",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    console.log(`[BulkWA] Job ${jobId} completed — ${uuids.length} messages processed`);
    console.log("[BulkWA][Compare] Endpoint delivery summary:", endpointStats);
    return NextResponse.json({ status: "completed", jobId });
  } catch (error) {
    console.error("[BulkWA] Error processing job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
