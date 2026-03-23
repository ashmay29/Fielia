import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import { sendWhatsAppTemplate, normalizePhoneNumber } from "@/lib/whatsapp";

/**
 * Bulk WhatsApp Message API Endpoint
 * POST: /api/bulk-send
 * 
 * Sends WhatsApp messages to all contacts in the CSV file
 * Returns progress and results
 */

interface BulkSendResult {
  phone: string;
  name: string;
  success: boolean;
  whatsappMessageId?: string;
  error?: string;
  timestamp: string;
}

interface BulkSendResponse {
  success: boolean;
  stats: {
    total: number;
    sent: number;
    failed: number;
    skipped: number;
  };
  results: BulkSendResult[];
  resultsFile?: string;
  timestamp: string;
  duration: string;
}

const CONFIG = {
  TEMPLATE_NAME: "felia_nfc",
  HEADER_IMAGE_URL: "https://res.cloudinary.com/doyttqu8x/image/upload/v1772821919/whatsapp-media/axx1pmp4va0yji1fsujk.jpg",
  TEMPLATE_BODY_VARIABLES: [
    "Mumbai's first Cocktail Cinema Bar & European Supper Theatre,",
    "nestled within the iconic Race Course.",
  ],
  MESSAGE_DELAY_MS: 150,
};

type BulkSendOverrides = {
  csvPath?: string;
  templateName?: string;
  templateVariables?: string[];
  mediaUrl?: string | null;
  messageDelayMs?: number;
  endpointMode?: "standard" | "marketing";
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const results: BulkSendResult[] = [];
  let sent = 0,
    failed = 0,
    skipped = 0;

  try {
    const body = (await request.json().catch(() => ({}))) as BulkSendOverrides;

    const resolvedCsvPath = body.csvPath
      ? path.isAbsolute(body.csvPath)
        ? body.csvPath
        : path.join(process.cwd(), body.csvPath)
      : path.join(process.cwd(), "data/Bulk message - Sheet1.csv");

    const templateName = body.templateName || CONFIG.TEMPLATE_NAME;
    const templateVariables = Array.isArray(body.templateVariables)
      ? body.templateVariables
      : CONFIG.TEMPLATE_BODY_VARIABLES;
    const mediaUrl =
      body.mediaUrl === null ? undefined : body.mediaUrl || CONFIG.HEADER_IMAGE_URL;
    const messageDelayMs =
      typeof body.messageDelayMs === "number" && body.messageDelayMs >= 0
        ? body.messageDelayMs
        : CONFIG.MESSAGE_DELAY_MS;
    const endpointMode = body.endpointMode === "standard" ? "standard" : "marketing";

    // Read and parse CSV
    if (!fs.existsSync(resolvedCsvPath)) {
      return NextResponse.json(
        { error: `CSV file not found at ${resolvedCsvPath}` },
        { status: 400 }
      );
    }

    const fileContent = fs.readFileSync(resolvedCsvPath, "utf-8");
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const total = records.length;

    console.log(`📧 Starting bulk send to ${total} contacts...`);

    // Send messages
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const name = record["Name:"]?.trim();
      const phone = record["Contact:"]?.trim();

      if (!name || !phone) {
        skipped++;
        results.push({
          phone: phone || "unknown",
          name: name || "unknown",
          success: false,
          error: "Invalid row: missing name or phone",
          timestamp: new Date().toISOString(),
        });
        continue;
      }

      const normalizedPhone = normalizePhoneNumber(phone);

      if (!normalizedPhone) {
        skipped++;
        results.push({
          phone,
          name,
          success: false,
          error: "Invalid phone number format",
          timestamp: new Date().toISOString(),
        });
        continue;
      }

      try {
        const result = await sendWhatsAppTemplate(
          normalizedPhone,
          templateName,
          templateVariables,
          mediaUrl,
          {
            endpointMode,
          }
        );

        if (result.success) {
          sent++;
          results.push({
            phone: normalizedPhone,
            name,
            success: true,
            whatsappMessageId: result.whatsappMessageId,
            timestamp: new Date().toISOString(),
          });
          console.log(`✅ [${i + 1}/${total}] ${name} → Sent`);
        } else {
          failed++;
          results.push({
            phone: normalizedPhone,
            name,
            success: false,
            error: result.error || "Unknown error",
            timestamp: new Date().toISOString(),
          });
          console.log(`❌ [${i + 1}/${total}] ${name} → Failed: ${result.error}`);
        }
      } catch (err: any) {
        failed++;
        results.push({
          phone: normalizedPhone,
          name,
          success: false,
          error: err.message || "Exception occurred",
          timestamp: new Date().toISOString(),
        });
        console.log(`❌ [${i + 1}/${total}] ${name} → Exception: ${err.message}`);
      }

      // Rate limiting delay
      if (i < records.length - 1) {
        await sleep(messageDelayMs);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Save results to file
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const resultsFile = path.join(logsDir, "bulk-send-results.json");
    const report = {
      metadata: {
        templateName,
        templateVariables,
        csvPath: resolvedCsvPath,
        messageDelayMs,
        mediaUrl: mediaUrl || null,
        endpointMode,
        timestamp: new Date().toISOString(),
        duration: duration + "s",
      },
      stats: { total, sent, failed, skipped },
      results,
    };

    fs.writeFileSync(resultsFile, JSON.stringify(report, null, 2), "utf-8");

    const response: BulkSendResponse = {
      success: true,
      stats: { total, sent, failed, skipped },
      results,
      resultsFile: resultsFile,
      timestamp: new Date().toISOString(),
      duration: duration + "s",
    };

    console.log(`✅ Bulk send complete: ${sent}/${total} successful`);
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Use POST to start bulk sending",
    usage: "POST /api/bulk-send",
  });
}
