import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import dbConnect from "@/lib/db";
import Card from "@/models/Card";
import MessageLog from "@/models/MessageLog";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";

const receiver = new Receiver({
  currentSigningKey: process.env.UPSTASH_QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.UPSTASH_QSTASH_NEXT_SIGNING_KEY!,
});

// Configuration
const BATCH_SIZE = 50;
const INTER_MESSAGE_DELAY_MS = 50; // ~80 msgs/sec to stay within Meta rate limits

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
    }: {
      jobId: string;
      uuids: string[];
      templateName: string;
      templateVariables: string[];
      mediaUrl?: string;
    } = payload;

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

    // Process in batches
    for (let i = 0; i < uuids.length; i += BATCH_SIZE) {
      const batch = uuids.slice(i, i + BATCH_SIZE);

      for (const uuid of batch) {
        const phone = cardMap.get(uuid);

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
          );

          if (result.success) {
            await MessageLog.findOneAndUpdate(
              { jobId, uuid },
              {
                $set: {
                  status: "sent",
                  whatsappMessageId: result.whatsappMessageId,
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
              );

              if (retry.success) {
                await MessageLog.findOneAndUpdate(
                  { jobId, uuid },
                  {
                    $set: {
                      status: "sent",
                      whatsappMessageId: retry.whatsappMessageId,
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
                error: err.message || "Unexpected error",
              },
            },
          );
        }

        // Throttle between messages
        if (i + batch.indexOf(uuid) < uuids.length - 1) {
          await sleep(INTER_MESSAGE_DELAY_MS);
        }
      }
    }

    console.log(`[BulkWA] Job ${jobId} completed — ${uuids.length} messages processed`);
    return NextResponse.json({ status: "completed", jobId });
  } catch (error) {
    console.error("[BulkWA] Error processing job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
