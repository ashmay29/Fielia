import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import * as dotenv from "dotenv";
import { normalizePhoneNumber, sendWhatsAppTemplate } from "../src/lib/whatsapp";

dotenv.config({ path: path.join(process.cwd(), ".env") });

interface BlockedContact {
  "Name": string;
  "Phone Number": string;
  "Error Code": string;
  "Error Message": string;
}

interface SendResult {
  phone: string;
  name: string;
  success: boolean;
  whatsappMessageId?: string;
  error?: string;
  timestamp: string;
}

const TEMPLATE_NAME = "felia_nfc";
const HEADER_IMAGE_URL =
  "https://res.cloudinary.com/doyttqu8x/image/upload/v1772821919/whatsapp-media/axx1pmp4va0yji1fsujk.jpg";
const TEMPLATE_BODY_VARIABLES = [
  "Mumbai's first Cocktail Cinema Bar & European Supper Theatre,",
  "nestled within the iconic Race Course.",
];

async function resendToBlockedContacts() {
  console.log("🔄 Resending messages to previously blocked contacts...\n");

  // Read the blocked contacts CSV
  const csvPath = path.join(process.cwd(), "logs/blocked-contacts-131049.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");

  const records: BlockedContact[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const resumeFrom = Number(process.env.RESUME_FROM || "0");
  const retryRecords = records.slice(Math.max(0, resumeFrom));

  console.log(`📋 Found ${records.length} blocked contacts to retry`);
  if (resumeFrom > 0) {
    console.log(`⏩ Resuming from index ${resumeFrom} (processing ${retryRecords.length})\n`);
  } else {
    console.log();
  }
  console.log("⚠️  NOTE: These contacts were blocked due to Meta's 'healthy ecosystem'");
  console.log("    policy. Most will likely be blocked again, but let's verify...\n");

  const results: SendResult[] = [];
  const delay = 150; // 150ms between sends

  const startTime = Date.now();

  for (let i = 0; i < retryRecords.length; i++) {
    const contact = retryRecords[i];
    const phone = contact["Phone Number"];
    const name = contact["Name"];
    const normalizedPhone = normalizePhoneNumber(phone);

    // Show progress every 50 messages
    if (i % 50 === 0) {
      console.log(
        `Progress: ${i}/${retryRecords.length} (${Math.round((i / retryRecords.length) * 100)}%)`
      );
    }

    if (!normalizedPhone) {
      results.push({
        phone,
        name,
        success: false,
        error: "Invalid phone number format",
        timestamp: new Date().toISOString(),
      });
      continue;
    }

    const sendResult = await sendWhatsAppTemplate(
      normalizedPhone,
      TEMPLATE_NAME,
      TEMPLATE_BODY_VARIABLES,
      HEADER_IMAGE_URL,
    );

    results.push({
      phone: normalizedPhone,
      name,
      success: sendResult.success,
      whatsappMessageId: sendResult.whatsappMessageId,
      error: sendResult.error,
      timestamp: new Date().toISOString(),
    });

    // Rate limiting delay
    if (i < retryRecords.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Calculate stats
  const stats = {
    total: results.length,
    sent: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
  };
  const sentPct = stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0;
  const failedPct = stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0;

  console.log("\n" + "=".repeat(80));
  console.log("📊 RESEND RESULTS");
  console.log("=".repeat(80));
  console.log(`Total contacts: ${stats.total}`);
  console.log(`✅ Accepted by API: ${stats.sent} (${sentPct}%)`);
  console.log(`❌ Failed at API: ${stats.failed} (${failedPct}%)`);
  console.log(`⏱️  Duration: ${duration}s`);
  console.log("=".repeat(80));

  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultsPath = path.join(
    process.cwd(),
    `logs/resend-blocked-results-${timestamp}.json`
  );

  const report = {
    metadata: {
      templateName: TEMPLATE_NAME,
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      source: "blocked-contacts-131049.csv",
      resumeFrom,
    },
    stats,
    results,
  };

  fs.writeFileSync(resultsPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Results saved to: ${resultsPath}`);

  console.log("\n⏳ Now wait a few minutes for webhook delivery statuses...");
  console.log("   Then run: pnpm tsx scripts/parse-webhook-failures.ts");
}

resendToBlockedContacts().catch(console.error);
