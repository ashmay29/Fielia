"use server";

import Card from "@/models/Card";
import dbConnect from "@/lib/db";

export interface ScanEvent {
  uuid: string;
  firstName: string;
  lastName: string;
  timestamp: string;
  preference?: string;
  content?: string;
  phone?: string;
  address?: string;
  photo?: string; // Placeholder for future
}

export async function getRecentScans(
  timeWindowMs: number = 60 * 60 * 1000 // Default 1 hour
): Promise<{
  success: boolean;
  data?: ScanEvent[];
  error?: string;
}> {
  try {
    await dbConnect();

    const timeThreshold = new Date(Date.now() - timeWindowMs);

    const scans = await Card.aggregate([
      // 1. Match cards that have ANY scan in the last timeWindow
      {
        $match: {
          "scanHistory.timestamp": { $gte: timeThreshold },
        },
      },
      // 2. Unwind history to work with individual scan events
      { $unwind: "$scanHistory" },
      // 3. Match only the specific scans from the last timeWindow
      {
        $match: {
          "scanHistory.timestamp": { $gte: timeThreshold },
        },
      },
      // 4. Sort by timestamp descending (newest first)
      { $sort: { "scanHistory.timestamp": -1 } },
      // 5. Project the shape we want
      {
        $project: {
          _id: 0,
          uuid: 1,
          firstName: 1,
          lastName: 1,
          preference: 1,
          content: 1,
          phone: 1,
          address: 1,
          timestamp: "$scanHistory.timestamp",
        },
      },
    ]);

    // Serialize dates
    const serializedScans = scans.map((scan) => ({
      ...scan,
      timestamp: scan.timestamp.toISOString(),
    }));

    return { success: true, data: serializedScans };
  } catch (error) {
    console.error("Failed to fetch recent scans:", error);
    return { success: false, error: "Failed to fetch recent scans" };
  }
}
