const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID!;

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

// ─── Phone Number Normalization ───────────────────────────────────────────────

/**
 * Validates and normalizes a phone string to E.164 format.
 * Returns null for invalid/empty numbers.
 *
 * Accepted inputs:
 *  - Already E.164: "+14155551234"
 *  - With leading zeros or spaces: "0 9876543210"
 *  - Indian 10-digit (default country code +91): "9876543210"
 */
export function normalizePhoneNumber(phone: string): string | null {
  if (!phone || typeof phone !== "string") return null;

  // Strip all non-digit characters except leading +
  let cleaned = phone.trim();
  const hasPlus = cleaned.startsWith("+");
  cleaned = cleaned.replace(/[^\d]/g, "");

  if (!cleaned) return null;

  // If it already had a +, re-add it
  if (hasPlus) {
    cleaned = `+${cleaned}`;
  }

  // Already E.164
  if (cleaned.startsWith("+") && cleaned.length >= 8 && cleaned.length <= 16) {
    return cleaned;
  }

  // If starts with "00" (international dialling prefix) → replace with "+"
  if (cleaned.startsWith("00") && cleaned.length >= 10) {
    return `+${cleaned.slice(2)}`;
  }

  // 10-digit number (Indian) → prepend +91
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  // 11-digit starting with 0 (local trunk code) → assume Indian, strip leading 0
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return `+91${cleaned.slice(1)}`;
  }

  // 12-digit starting with 91 (Indian without +)
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+${cleaned}`;
  }

  // Fallback: if between 8-15 digits, assume it's valid with a missing +
  if (cleaned.length >= 8 && cleaned.length <= 15) {
    return `+${cleaned}`;
  }

  return null;
}

// ─── Send WhatsApp Template ───────────────────────────────────────────────────

export interface SendTemplateResult {
  success: boolean;
  whatsappMessageId?: string;
  error?: string;
}

/**
 * Sends a WhatsApp template message.
 * If `mediaUrl` is provided, it is included in the header component using
 * Meta's `{ link: mediaUrl }` structure — the URL must be publicly accessible
 * (Cloudinary URLs satisfy this).
 */
export async function sendWhatsAppTemplate(
  toNumber: string,
  templateName: string,
  variables: string[],
  mediaUrl?: string,
): Promise<SendTemplateResult> {
  const components: any[] = [];

  // Header component with media link (if applicable)
  if (mediaUrl) {
    // Determine media type from URL
    const isDocument = mediaUrl.toLowerCase().endsWith(".pdf");
    const mediaType = isDocument ? "document" : "image";

    components.push({
      type: "header",
      parameters: [
        {
          type: mediaType,
          [mediaType]: { link: mediaUrl },
        },
      ],
    });
  }

  // Body component with template variables
  if (variables.length > 0) {
    components.push({
      type: "body",
      parameters: variables.map((v) => ({
        type: "text",
        text: v,
      })),
    });
  }

  const payload: any = {
    messaging_product: "whatsapp",
    to: toNumber,
    type: "template",
    template: {
      name: templateName,
      language: { code: "en" },
      components,
    },
  };

  console.log("[WhatsApp] Sending template message:", {
    to: toNumber,
    template: templateName,
    variables: variables.length,
    mediaUrl: mediaUrl ? "provided" : "none",
  });

  try {
    const res = await fetch(
      `${GRAPH_API_BASE}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await res.json();

    console.log("[WhatsApp] API Response:", {
      status: res.status,
      data: data,
    });

    if (!res.ok) {
      const errMsg =
        data?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      console.error("[WhatsApp] Send failed:", errMsg);
      console.error("[WhatsApp] Full error details:", data?.error);
      return { success: false, error: errMsg };
    }

    const messageId = data?.messages?.[0]?.id;
    console.log("[WhatsApp] Message sent successfully:", messageId);
    return { success: true, whatsappMessageId: messageId };
  } catch (err: any) {
    console.error("[WhatsApp] Network error:", err);
    return { success: false, error: err.message || "Network error" };
  }
}

// ─── Fetch Message Templates ──────────────────────────────────────────────────

export interface TemplateComponent {
  type: string;
  format?: string;
  text?: string;
  example?: any;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  status: string;
  language: string;
  category: string;
  components: TemplateComponent[];
}

// Simple in-memory cache for templates
let templateCache: { data: WhatsAppTemplate[]; expiresAt: number } | null =
  null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches approved message templates from the WhatsApp Business Account.
 * Results are cached in-memory for 5 minutes.
 */
export async function fetchMessageTemplates(): Promise<WhatsAppTemplate[]> {
  if (templateCache && Date.now() < templateCache.expiresAt) {
    return templateCache.data;
  }

  try {
    const res = await fetch(
      `${GRAPH_API_BASE}/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates?status=APPROVED&limit=100`,
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        },
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch templates: ${res.status}`);
    }

    const json = await res.json();

    const templates: WhatsAppTemplate[] = (json.data || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      status: t.status,
      language: t.language,
      category: t.category,
      components: t.components || [],
    }));

    templateCache = {
      data: templates,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };

    return templates;
  } catch (err) {
    console.error("Error fetching WhatsApp templates:", err);
    // Return cached data if available, even if expired
    if (templateCache) return templateCache.data;
    return [];
  }
}
