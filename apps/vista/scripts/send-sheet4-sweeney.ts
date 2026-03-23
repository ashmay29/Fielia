#!/usr/bin/env tsx
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

dotenv.config({ path: path.join(__dirname, "../.env"), override: true });

interface RawRow {
  [key: string]: string;
}

interface Contact {
  name: string;
  originalPhone: string;
  normalizedPhone: string;
}

interface SendResult {
  name: string;
  originalPhone: string;
  normalizedPhone: string;
  success: boolean;
  whatsappMessageId?: string;
  error?: string;
  sentAt: string;
}

const CONFIG = {
  CSV_PATH: path.join(__dirname, "../data/Bulk message - Sheet4.csv"),
  TEMPLATE_NAME: "sweeney",
  TEMPLATE_VARIABLES: [] as string[],
  MESSAGE_DELAY_MS: 500,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,
  LOG_DIR: path.join(__dirname, "../logs"),
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const mod = await import("../src/lib/whatsapp");
  const normalizePhoneNumber = mod.normalizePhoneNumber;
  const sendWhatsAppTemplate = mod.sendWhatsAppTemplate;

  if (!fs.existsSync(CONFIG.CSV_PATH)) {
    throw new Error(`CSV not found: ${CONFIG.CSV_PATH}`);
  }

  const csvText = fs.readFileSync(CONFIG.CSV_PATH, "utf-8");
  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as RawRow[];

  const invalidRows: Array<{ name: string; originalPhone: string }> = [];
  const duplicateRows: Array<{
    normalizedPhone: string;
    keptName: string;
    skippedName: string;
    skippedPhone: string;
  }> = [];

  const uniqueMap = new Map<string, Contact>();

  for (const row of rows) {
    const name = (row["Name:"] || "").trim();
    const originalPhone = (row["Contact:"] || "").trim();

    if (!name || !originalPhone) {
      invalidRows.push({ name: name || "(missing)", originalPhone: originalPhone || "(missing)" });
      continue;
    }

    const normalized = normalizePhoneNumber(originalPhone);
    if (!normalized) {
      invalidRows.push({ name, originalPhone });
      continue;
    }

    if (uniqueMap.has(normalized)) {
      const kept = uniqueMap.get(normalized)!;
      duplicateRows.push({
        normalizedPhone: normalized,
        keptName: kept.name,
        skippedName: name,
        skippedPhone: originalPhone,
      });
      continue;
    }

    uniqueMap.set(normalized, {
      name,
      originalPhone,
      normalizedPhone: normalized,
    });
  }

  const uniqueContacts = Array.from(uniqueMap.values());

  if (!fs.existsSync(CONFIG.LOG_DIR)) {
    fs.mkdirSync(CONFIG.LOG_DIR, { recursive: true });
  }

  const runStamp = new Date().toISOString().replace(/[.:]/g, "-");
  const resultsPath = path.join(CONFIG.LOG_DIR, `bulk-send-sheet4-sweeney-${runStamp}.json`);
  const invalidPath = path.join(CONFIG.LOG_DIR, `bulk-send-sheet4-sweeney-invalid-${runStamp}.json`);
  const duplicatesPath = path.join(CONFIG.LOG_DIR, `bulk-send-sheet4-sweeney-duplicates-${runStamp}.json`);

  console.log("=".repeat(90));
  console.log("Starting Sheet4 bulk send: template=sweeney, vars=0, delay=500ms");
  console.log("=".repeat(90));
  console.log(`CSV rows: ${rows.length}`);
  console.log(`Unique valid recipients: ${uniqueContacts.length}`);
  console.log(`Invalid rows: ${invalidRows.length}`);
  console.log(`Duplicate rows skipped: ${duplicateRows.length}`);
  console.log("=".repeat(90));

  const results: SendResult[] = [];
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < uniqueContacts.length; i++) {
    const c = uniqueContacts[i];
    const progress = `[${i + 1}/${uniqueContacts.length}]`;
    let lastError = "";
    let success = false;
    let messageId: string | undefined;

    for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
      const result = await sendWhatsAppTemplate(
        c.normalizedPhone,
        CONFIG.TEMPLATE_NAME,
        CONFIG.TEMPLATE_VARIABLES,
      );

      if (result.success) {
        success = true;
        messageId = result.whatsappMessageId;
        break;
      }

      lastError = result.error || "Unknown error";
      if (attempt < CONFIG.MAX_RETRIES) {
        await sleep(CONFIG.RETRY_DELAY_MS);
      }
    }

    if (success) {
      sent++;
      console.log(`${progress} SENT ${c.name} (${c.normalizedPhone}) id=${messageId}`);
    } else {
      failed++;
      console.log(`${progress} FAILED ${c.name} (${c.normalizedPhone}) error=${lastError}`);
    }

    results.push({
      name: c.name,
      originalPhone: c.originalPhone,
      normalizedPhone: c.normalizedPhone,
      success,
      whatsappMessageId: messageId,
      error: success ? undefined : lastError,
      sentAt: new Date().toISOString(),
    });

    const isLast = i === uniqueContacts.length - 1;
    if (!isLast) {
      await sleep(CONFIG.MESSAGE_DELAY_MS);
    }
  }

  const report = {
    metadata: {
      startedAt: runStamp,
      completedAt: new Date().toISOString(),
      csvPath: CONFIG.CSV_PATH,
      templateName: CONFIG.TEMPLATE_NAME,
      templateVariables: CONFIG.TEMPLATE_VARIABLES,
      delayMs: CONFIG.MESSAGE_DELAY_MS,
      maxRetries: CONFIG.MAX_RETRIES,
      retryDelayMs: CONFIG.RETRY_DELAY_MS,
    },
    stats: {
      csvRows: rows.length,
      uniqueRecipients: uniqueContacts.length,
      invalidRows: invalidRows.length,
      duplicateRowsSkipped: duplicateRows.length,
      sent,
      failed,
    },
    results,
  };

  fs.writeFileSync(resultsPath, JSON.stringify(report, null, 2), "utf-8");
  fs.writeFileSync(invalidPath, JSON.stringify(invalidRows, null, 2), "utf-8");
  fs.writeFileSync(duplicatesPath, JSON.stringify(duplicateRows, null, 2), "utf-8");

  console.log("=".repeat(90));
  console.log("Bulk send completed.");
  console.log(`Sent: ${sent}`);
  console.log(`Failed: ${failed}`);
  console.log(`Results: ${resultsPath}`);
  console.log(`Invalids: ${invalidPath}`);
  console.log(`Duplicates: ${duplicatesPath}`);
  console.log("=".repeat(90));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
