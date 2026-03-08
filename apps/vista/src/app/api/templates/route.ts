import { NextResponse } from "next/server";
import { fetchMessageTemplates } from "@/lib/whatsapp";
import { getSession } from "@/lib/auth";

/**
 * GET /api/templates
 * Returns the list of approved WhatsApp message templates
 * with their component definitions so the frontend can render dynamic input fields.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await fetchMessageTemplates();

    // Transform templates for the frontend — extract useful info
    const formatted = templates.map((t) => {
      // Find header component (may contain media type)
      const headerComponent = t.components.find((c) => c.type === "HEADER");
      // Find body component (contains variable placeholders)
      const bodyComponent = t.components.find((c) => c.type === "BODY");

      // Count variables in body text like {{1}}, {{2}}, etc.
      const bodyText = bodyComponent?.text || "";
      const variableMatches = bodyText.match(/\{\{\d+\}\}/g) || [];
      const variableCount = variableMatches.length;

      return {
        id: t.id,
        name: t.name,
        language: t.language,
        category: t.category,
        headerType: headerComponent?.format || null, // IMAGE, DOCUMENT, VIDEO, TEXT, or null
        bodyText,
        variableCount,
      };
    });

    return NextResponse.json({ templates: formatted });
  } catch (error) {
    console.error("[Templates API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 },
    );
  }
}
