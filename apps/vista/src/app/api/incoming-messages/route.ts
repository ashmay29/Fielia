import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import IncomingMessage from "@/models/IncomingMessage";

/**
 * GET /api/incoming-messages
 * Fetches all incoming messages (replies from users)
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = parseInt(searchParams.get("skip") || "0");
    const sortBy = searchParams.get("sort") || "receivedAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;

    // Fetch incoming messages
    const messages = await IncomingMessage.find({})
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await IncomingMessage.countDocuments({});

    return NextResponse.json(
      {
        success: true,
        count: messages.length,
        total: totalCount,
        messages: messages.map((msg) => ({
          id: msg._id.toString(),
          messageId: msg.waMessageId,
          from: msg.fromWaId,
          senderName: msg.fromProfileName || "Unknown",
          messageType: msg.messageType,
          text: msg.textBody,
          receivedAt: msg.receivedAt,
          createdAt: msg.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Error fetching incoming messages:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch incoming messages",
      },
      { status: 500 }
    );
  }
}
