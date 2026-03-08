import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * GET /api/upload-signature
 * Generates a signed Cloudinary upload signature for the frontend.
 * This allows direct browser → Cloudinary uploads without exposing the API secret.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const timestamp = Math.round(Date.now() / 1000);

    const params = {
      timestamp,
      folder: "whatsapp-media",
    };

    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET!,
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
      apiKey: process.env.CLOUDINARY_API_KEY!,
      folder: "whatsapp-media",
    });
  } catch (error) {
    console.error("[Upload Signature] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 },
    );
  }
}
