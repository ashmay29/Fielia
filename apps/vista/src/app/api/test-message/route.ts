import { sendWhatsAppTemplate, normalizePhoneNumber } from "@/lib/whatsapp";
import { NextRequest, NextResponse } from "next/server";

/**
 * Test WhatsApp message endpoint
 * GET: /api/test-message?phone=7977539750
 */
export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone");
  const templateParam = request.nextUrl.searchParams.get("template");
  const var1 = request.nextUrl.searchParams.get("var1");
  const mediaUrlParam = request.nextUrl.searchParams.get("mediaUrl");
  const endpointMode = request.nextUrl.searchParams.get("endpoint") || "marketing";

  if (!phone) {
    return NextResponse.json(
      { error: "Missing phone parameter" },
      { status: 400 }
    );
  }

  const normalizedPhone = normalizePhoneNumber(phone);

  if (!normalizedPhone) {
    return NextResponse.json(
      { error: "Invalid phone number format", input: phone },
      { status: 400 }
    );
  }

  const templateName = templateParam || "felia_nfc";
  const variables = var1
    ? [var1]
    : [
        "Mumbai's first Cocktail Cinema Bar & European Supper Theatre,",
        "nestled within the iconic Race Course.",
      ];
  const mediaUrl =
    mediaUrlParam === "none"
      ? undefined
      : mediaUrlParam ||
        "https://res.cloudinary.com/doyttqu8x/image/upload/v1772821919/whatsapp-media/axx1pmp4va0yji1fsujk.jpg";

  try {
    const result = await sendWhatsAppTemplate(
      normalizedPhone,
      templateName,
      variables,
      mediaUrl,
      {
        endpointMode: endpointMode === "standard" ? "standard" : "marketing",
      }
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Message sent successfully",
        phone: normalizedPhone,
        whatsappMessageId: result.whatsappMessageId,
        endpointRequested: result.endpointRequested,
        endpointUsed: result.endpointUsed,
        fallbackUsed: result.fallbackUsed,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          phone: normalizedPhone,
          endpointRequested: result.endpointRequested,
          endpointUsed: result.endpointUsed,
          fallbackUsed: result.fallbackUsed,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        phone: normalizedPhone,
      },
      { status: 500 }
    );
  }
}
