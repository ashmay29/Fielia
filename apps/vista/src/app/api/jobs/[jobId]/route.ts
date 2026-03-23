import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MessageLog from "@/models/MessageLog";
import { getSession } from "@/lib/auth";

/**
 * GET /api/jobs/[jobId]
 * Returns the progress of a bulk messaging job by aggregating MessageLog entries.
 */
export async function GET(
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
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const logs = await MessageLog.find({ jobId }).lean();

    if (logs.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const total = logs.length;
    const sentOnly = logs.filter((l) => l.status === "sent").length;
    const delivered = logs.filter((l) => l.status === "delivered").length;
    const read = logs.filter((l) => l.status === "read").length;
    const failed = logs.filter((l) => l.status === "failed").length;
    const pending = logs.filter(
      (l) => l.status === "queued" || l.status === "sending",
    ).length;
    const processed = total - pending;
    // "sent" includes sent, delivered, and read (all successfully sent messages)
    const sent = sentOnly + delivered + read;

    const failures = logs
      .filter((l) => l.status === "failed")
      .map((l) => ({
        uuid: l.uuid,
        phone: l.phone,
        error: l.error || "Unknown error",
      }));

    return NextResponse.json({
      jobId,
      total,
      sent,
      delivered,
      read,
      failed,
      pending,
      processed,
      failures,
    });
  } catch (error) {
    console.error("[Jobs API] Error fetching job progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
