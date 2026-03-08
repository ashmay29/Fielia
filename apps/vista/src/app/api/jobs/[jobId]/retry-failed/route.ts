import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";
import dbConnect from "@/lib/db";
import MessageLog from "@/models/MessageLog";
import { getSession } from "@/lib/auth";

/**
 * POST /api/jobs/[jobId]/retry-failed
 * Re-enqueues all failed recipients for a job without creating duplicate log rows.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    await dbConnect();

    const failedLogs = await MessageLog.find({ jobId, status: "failed" })
      .select("uuid templateName templateVariables mediaUrl")
      .lean();

    if (failedLogs.length === 0) {
      return NextResponse.json(
        { error: "No failed messages found for this job" },
        { status: 400 },
      );
    }

    const templateName = failedLogs[0].templateName;

    // Safety check for legacy jobs created before payload snapshot fields existed.
    // Without these fields, we can't safely reconstruct the original template payload.
    const hasMissingPayloadSnapshot = failedLogs.some(
      (log) => typeof log.templateVariables === "undefined",
    );

    if (hasMissingPayloadSnapshot) {
      return NextResponse.json(
        {
          error:
            "This job was created before retry payload snapshots were saved. Please resend from the UI: select the failed users, re-enter template variables/media, then send again.",
          code: "MISSING_PAYLOAD_SNAPSHOT",
          jobId,
          failedCount: failedLogs.length,
          failedUuids: failedLogs.map((log) => log.uuid),
        },
        { status: 409 },
      );
    }

    const templateVariables = Array.isArray(failedLogs[0].templateVariables)
      ? failedLogs[0].templateVariables
      : [];
    const mediaUrl = failedLogs[0].mediaUrl || undefined;

    // Keep status tracking idempotent: reuse same rows and transition state.
    await MessageLog.updateMany(
      { jobId, status: "failed" },
      {
        $set: {
          status: "queued",
          updatedAt: new Date(),
        },
        $unset: {
          error: "",
          whatsappMessageId: "",
          sentAt: "",
        },
      },
    );

    const qstashClient = new Client({
      token: process.env.UPSTASH_QSTASH_TOKEN!,
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

    if (!baseUrl) {
      return NextResponse.json(
        {
          error:
            "NEXT_PUBLIC_APP_URL must be set for local development (use ngrok URL)",
        },
        { status: 500 },
      );
    }

    await qstashClient.publishJSON({
      url: `${baseUrl}/api/queue/bulk-whatsapp`,
      body: {
        jobId,
        uuids: failedLogs.map((log) => log.uuid),
        templateName,
        templateVariables,
        mediaUrl,
      },
      retries: 3,
    });

    return NextResponse.json({
      success: true,
      jobId,
      retriedCount: failedLogs.length,
      message: "Failed messages queued for retry",
    });
  } catch (error) {
    console.error("[Retry Failed API] Error retrying failed messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
