import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

// Force values from .env so stale exported shell vars do not override runtime config.
dotenv.config({ path: path.join(process.cwd(), ".env"), override: true });

interface WebhookFailure {
  whatsappMessageId: string;
  recipientPhone: string;
  status: string;
  errorCode?: number;
  errorTitle?: string;
  errorMessage?: string;
  timestamp?: string;
}

interface RetryTarget {
  phone: string;
  normalizedPhone: string | null;
  errorCode?: number;
  errorMessage?: string;
}

interface RetryResult {
  phone: string;
  success: boolean;
  whatsappMessageId?: string;
  error?: string;
  timestamp: string;
}

interface SendTemplateResult {
  success: boolean;
  whatsappMessageId?: string;
  error?: string;
}

const TEMPLATE_NAME = "felia_nfc";
const HEADER_IMAGE_URL =
  "https://res.cloudinary.com/doyttqu8x/image/upload/v1772821919/whatsapp-media/axx1pmp4va0yji1fsujk.jpg";
const TEMPLATE_BODY_VARIABLES = [
  "Mumbai's first Cocktail Cinema Bar & European Supper Theatre,",
  "nestled within the iconic Race Course.",
];

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

function normalizePhoneNumber(phone: string): string | null {
  if (!phone || typeof phone !== "string") return null;

  let cleaned = phone.trim();
  const hasPlus = cleaned.startsWith("+");
  cleaned = cleaned.replace(/[^\d]/g, "");

  if (!cleaned) return null;
  if (hasPlus) cleaned = `+${cleaned}`;

  if (cleaned.startsWith("+") && cleaned.length >= 8 && cleaned.length <= 16) {
    return cleaned;
  }
  if (cleaned.startsWith("00") && cleaned.length >= 10) {
    return `+${cleaned.slice(2)}`;
  }
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return `+91${cleaned.slice(1)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+${cleaned}`;
  }
  if (cleaned.length >= 8 && cleaned.length <= 15) {
    return `+${cleaned}`;
  }

  return null;
}

async function sendWhatsAppTemplateRuntime(
  toNumber: string,
  templateName: string,
  variables: string[],
  mediaUrl?: string,
): Promise<SendTemplateResult> {
  const token = (process.env.WHATSAPP_ACCESS_TOKEN || "").trim();
  const phoneId = (process.env.WHATSAPP_PHONE_NUMBER_ID || "").trim();

  if (!token || !phoneId) {
    return {
      success: false,
      error: "Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID",
    };
  }

  const components: any[] = [];

  if (mediaUrl) {
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

  if (variables.length > 0) {
    components.push({
      type: "body",
      parameters: variables.map((v) => ({ type: "text", text: v })),
    });
  }

  const payload = {
    messaging_product: "whatsapp",
    to: toNumber,
    type: "template",
    template: {
      name: templateName,
      language: { code: "en" },
      components,
    },
  };

  try {
    const controller = new AbortController();
    const timeoutMs = Number(process.env.REQUEST_TIMEOUT_MS || "15000");
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`${GRAPH_API_BASE}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json();

    if (!res.ok) {
      const errMsg = data?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      return { success: false, error: errMsg };
    }

    return { success: true, whatsappMessageId: data?.messages?.[0]?.id };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return { success: false, error: "Request timed out" };
    }
    return { success: false, error: err?.message || "Network error" };
  }
}

function tokenPreview(token: string): string {
  if (token.length <= 10) return "[too-short]";
  return `${token.slice(0, 6)}...${token.slice(-4)} (len=${token.length})`;
}

async function verifyWhatsAppAuth(): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    return { ok: false, error: "Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID" };
  }

  // Trim accidental whitespace/newlines copied into env values.
  const cleanToken = token.trim();
  process.env.WHATSAPP_ACCESS_TOKEN = cleanToken;

  try {
    const res = await fetch(`${GRAPH_API_BASE}/${phoneId}`, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        error: data?.error?.message || `Auth check failed: HTTP ${res.status}`,
      };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

function parseErrorCodeFilter(): number[] | null {
  const raw = process.env.ERROR_CODES?.trim();
  if (!raw) return null;

  const parsed = raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n));

  return parsed.length > 0 ? parsed : null;
}

function buildRetryTargets(
  failures: WebhookFailure[],
  dedupe: boolean,
  allowedErrorCodes: number[] | null,
): RetryTarget[] {
  const filtered = failures.filter((f) => {
    if (!f.recipientPhone) return false;
    if (!allowedErrorCodes) return true;
    if (typeof f.errorCode !== "number") return false;
    return allowedErrorCodes.includes(f.errorCode);
  });

  if (!dedupe) {
    return filtered.map((f) => ({
      phone: f.recipientPhone,
      normalizedPhone: normalizePhoneNumber(f.recipientPhone),
      errorCode: f.errorCode,
      errorMessage: f.errorMessage,
    }));
  }

  // Keep latest occurrence per phone
  const byPhone = new Map<string, WebhookFailure>();
  for (const f of filtered) {
    byPhone.set(f.recipientPhone, f);
  }

  return Array.from(byPhone.values()).map((f) => ({
    phone: f.recipientPhone,
    normalizedPhone: normalizePhoneNumber(f.recipientPhone),
    errorCode: f.errorCode,
    errorMessage: f.errorMessage,
  }));
}

async function resendToFailures() {
  const rawToken = process.env.WHATSAPP_ACCESS_TOKEN || "";
  if (!rawToken.trim()) {
    throw new Error("WHATSAPP_ACCESS_TOKEN is empty. Update .env with a valid token.");
  }

  console.log(`Using token: ${tokenPreview(rawToken.trim())}`);

  const authCheck = await verifyWhatsAppAuth();
  if (!authCheck.ok) {
    throw new Error(
      `WhatsApp auth preflight failed: ${authCheck.error}. Refresh WHATSAPP_ACCESS_TOKEN in .env and retry.`,
    );
  }

  const dryRun = (process.env.DRY_RUN || "true").toLowerCase() !== "false";
  const dedupe = (process.env.DEDUPE || "true").toLowerCase() !== "false";
  const resumeFrom = Number(process.env.RESUME_FROM || "0");
  const maxCount = Number(process.env.MAX_COUNT || "0");
  const delayMs = Number(process.env.DELAY_MS || "150");
  const progressEvery = Number(process.env.PROGRESS_EVERY || "10");
  const allowedErrorCodes = parseErrorCodeFilter();

  const failuresPath = path.join(process.cwd(), "logs/webhook-failures.json");
  if (!fs.existsSync(failuresPath)) {
    throw new Error(`Missing file: ${failuresPath}`);
  }

  const failures = JSON.parse(
    fs.readFileSync(failuresPath, "utf-8"),
  ) as WebhookFailure[];

  const retryTargets = buildRetryTargets(failures, dedupe, allowedErrorCodes);
  let targets = retryTargets.slice(Math.max(0, resumeFrom));
  if (maxCount > 0) {
    targets = targets.slice(0, maxCount);
  }

  const invalidPhones = targets.filter((t) => !t.normalizedPhone).length;

  console.log("🔁 Resend to failed recipients");
  console.log(`Total failure rows: ${failures.length}`);
  console.log(`Retry targets (${dedupe ? "deduped" : "raw"}): ${retryTargets.length}`);
  console.log(`After resumeFrom=${resumeFrom}: ${targets.length}`);
  if (maxCount > 0) {
    console.log(`MAX_COUNT active: ${maxCount}`);
  }
  console.log(`Invalid phone rows: ${invalidPhones}`);
  console.log(`Error code filter: ${allowedErrorCodes ? allowedErrorCodes.join(",") : "all"}`);
  console.log(`Delay: ${delayMs}ms`);
  console.log(`Request timeout: ${process.env.REQUEST_TIMEOUT_MS || "15000"}ms`);
  console.log(`Progress log every: ${progressEvery}`);
  console.log(`Dry run: ${dryRun}`);

  const sample = targets.slice(0, 10).map((t) => ({
    phone: t.phone,
    normalized: t.normalizedPhone,
    errorCode: t.errorCode,
    errorMessage: t.errorMessage,
  }));
  console.log("Sample targets:");
  console.log(JSON.stringify(sample, null, 2));

  if (dryRun) {
    console.log("\n✅ Dry run complete. Set DRY_RUN=false to send.");
    return;
  }

  const results: RetryResult[] = [];
  const startedAt = Date.now();
  let consecutiveAuthFailures = 0;

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];

    if (i % Math.max(1, progressEvery) === 0) {
      const pct = targets.length > 0 ? Math.round((i / targets.length) * 100) : 0;
      const sentSoFar = results.filter((r) => r.success).length;
      const failedSoFar = results.length - sentSoFar;
      console.log(`Progress: ${i}/${targets.length} (${pct}%) | sent=${sentSoFar} failed=${failedSoFar}`);
    }

    if (!t.normalizedPhone) {
      results.push({
        phone: t.phone,
        success: false,
        error: "Invalid phone number format",
        timestamp: new Date().toISOString(),
      });
      continue;
    }

    const sendResult = await sendWhatsAppTemplateRuntime(
      t.normalizedPhone,
      TEMPLATE_NAME,
      TEMPLATE_BODY_VARIABLES,
      HEADER_IMAGE_URL,
    );

    results.push({
      phone: t.normalizedPhone,
      success: sendResult.success,
      whatsappMessageId: sendResult.whatsappMessageId,
      error: sendResult.error,
      timestamp: new Date().toISOString(),
    });

    const errText = (sendResult.error || "").toLowerCase();
    const isAuthError = errText.includes("invalid oauth access token") || errText.includes("cannot parse access token");

    if (isAuthError) {
      consecutiveAuthFailures++;
      if (consecutiveAuthFailures >= 3) {
        console.error("\n⛔ Stopping early: repeated OAuth token failures detected.");
        console.error("   Update WHATSAPP_ACCESS_TOKEN in .env, then rerun with RESUME_FROM.");
        break;
      }
    } else {
      consecutiveAuthFailures = 0;
    }

    if (i < targets.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  const durationSeconds = ((Date.now() - startedAt) / 1000).toFixed(2);
  const sent = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  const report = {
    metadata: {
      timestamp: new Date().toISOString(),
      source: "logs/webhook-failures.json",
      dedupe,
      resumeFrom,
      delayMs,
      maxCount,
      errorCodes: allowedErrorCodes,
      duration: `${durationSeconds}s`,
      templateName: TEMPLATE_NAME,
    },
    stats: {
      total: results.length,
      sent,
      failed,
    },
    results,
  };

  const outPath = path.join(
    process.cwd(),
    `logs/resend-failures-results-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
  );
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log("\n📊 Resend complete");
  console.log(`Sent: ${sent}`);
  console.log(`Failed: ${failed}`);
  console.log(`Duration: ${durationSeconds}s`);
  console.log(`Report: ${outPath}`);
  console.log("\n⏳ Wait for webhooks, then run: pnpm tsx scripts/parse-webhook-failures.ts");
}

resendToFailures().catch((err) => {
  console.error("❌ Resend script failed:", err.message || err);
  process.exit(1);
});
