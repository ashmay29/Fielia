import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MessageLog from "@/models/MessageLog";
import { getSession } from "@/lib/auth";

/**
 * GET /api/jobs/latest
 * Returns status insights for the latest bulk WhatsApp job and all-time totals.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const latestLog = await MessageLog.findOne({})
      .sort({ updatedAt: -1 })
      .select("jobId updatedAt")
      .lean();

    const [
      totalCount,
      sentOnlyCount,
      deliveredCount,
      readCount,
      failedCount,
      pendingCount,
    ] = await Promise.all([
      MessageLog.countDocuments({}),
      MessageLog.countDocuments({ status: "sent" }),
      MessageLog.countDocuments({ status: "delivered" }),
      MessageLog.countDocuments({ status: "read" }),
      MessageLog.countDocuments({ status: "failed" }),
      MessageLog.countDocuments({ status: "queued" }),
    ]);

    const sentCount = sentOnlyCount + deliveredCount + readCount;

    const allJobs = {
      total: totalCount,
      processed: totalCount - pendingCount,
      sent: sentCount,
      delivered: deliveredCount,
      read: readCount,
      failed: failedCount,
      pending: pendingCount,
    };

    if (!latestLog?.jobId) {
      return NextResponse.json({
        latestJob: null,
        allJobs,
      });
    }

    const logs = await MessageLog.find({ jobId: latestLog.jobId }).lean();

    const total = logs.length;
    const sent = logs.filter((l) =>
      ["sent", "delivered", "read"].includes(l.status),
    ).length;
    const delivered = logs.filter((l) => l.status === "delivered").length;
    const read = logs.filter((l) => l.status === "read").length;
    const failed = logs.filter((l) => l.status === "failed").length;
    const pending = logs.filter((l) => l.status === "queued").length;
    const processed = total - pending;

    return NextResponse.json({
      latestJob: {
        jobId: latestLog.jobId,
        total,
        processed,
        sent,
        delivered,
        read,
        failed,
        pending,
        updatedAt: latestLog.updatedAt,
      },
      allJobs,
    });
  } catch (error) {
    console.error("[Jobs Latest API] Error fetching latest job insights:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
