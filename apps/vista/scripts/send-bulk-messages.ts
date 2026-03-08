#!/usr/bin/env tsx
/**
 * Bulk WhatsApp Message Sender with Queue System
 * 
 * Usage:
 *   pnpm tsx scripts/send-bulk-messages.ts
 * 
 * Features:
 * - Queue-based message sending with rate limiting
 * - Progress tracking and logging
 * - Resume capability from last failure
 * - Detailed success/failure reports
 */

import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import {
  sendWhatsAppTemplate,
  normalizePhoneNumber,
} from "../src/lib/whatsapp";

// ═══════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  CSV_PATH: path.join(__dirname, "../data/_Contact List 2026 - High Spenders  - GIGI.csv"),
  TEMPLATE_NAME: "felia_nfc",
  HEADER_IMAGE_URL: "https://res.cloudinary.com/doyttqu8x/image/upload/v1772821919/whatsapp-media/axx1pmp4va0yji1fsujk.jpg",
  TEMPLATE_BODY_VARIABLES: [
    "Mumbai’s first Cocktail Cinema Bar & European Supper Theatre,",
    "nestled within the iconic Race Course.",
  ],
  
  // Rate limiting: delay between each message (milliseconds)
  MESSAGE_DELAY_MS: 150,
  
  // Queue settings
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,
  
  // Logging paths
  LOG_DIR: path.join(__dirname, "../logs"),
  RESULTS_FILE: path.join(__dirname, "../logs/bulk-send-results.json"),
  ERROR_LOG_FILE: path.join(__dirname, "../logs/bulk-send-errors.log"),
};

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

interface Contact {
  name: string;
  phone: string;
  normalizedPhone: string | null;
}

interface SendResult {
  contact: Contact;
  success: boolean;
  whatsappMessageId?: string;
  error?: string;
  attempts: number;
  timestamp: string;
}

interface QueueStats {
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  inProgress: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CSV Parsing
// ═══════════════════════════════════════════════════════════════════════════

function parseCSV(filePath: string): Contact[] {
  console.log(`📄 Reading CSV from: ${filePath}`);
  
  const fileContent = fs.readFileSync(filePath, "utf-8");
  
  // Parse CSV - the file has two columns: Name and Contact
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const contacts: Contact[] = [];
  
  for (const record of records) {
    // The CSV has "Name:" and "Contact:" as headers
    const name = record["Name:"]?.trim();
    const phone = record["Contact:"]?.trim();
    
    if (!name || !phone) {
      console.warn(`⚠️  Skipping invalid row: name="${name}", phone="${phone}"`);
      continue;
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    
    contacts.push({
      name,
      phone,
      normalizedPhone,
    });
  }

  console.log(`✅ Parsed ${contacts.length} contacts from CSV`);
  return contacts;
}

// ═══════════════════════════════════════════════════════════════════════════
// Queue System
// ═══════════════════════════════════════════════════════════════════════════

class MessageQueue {
  private contacts: Contact[];
  private results: SendResult[] = [];
  private stats: QueueStats;
  private startTime: number = 0;

  constructor(contacts: Contact[]) {
    this.contacts = contacts;
    this.stats = {
      total: contacts.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      inProgress: 0,
    };
  }

  /**
   * Process the entire queue with rate limiting
   */
  async processQueue(): Promise<void> {
    console.log("\n" + "═".repeat(80));
    console.log("🚀 Starting Bulk Message Queue");
    console.log("═".repeat(80));
    console.log(`📊 Total contacts: ${this.stats.total}`);
    console.log(`⏱️  Delay between messages: ${CONFIG.MESSAGE_DELAY_MS}ms`);
    console.log(`🔄 Max retries per message: ${CONFIG.MAX_RETRIES}`);
    console.log("═".repeat(80) + "\n");

    this.startTime = Date.now();

    for (let i = 0; i < this.contacts.length; i++) {
      const contact = this.contacts[i];
      const progress = `[${i + 1}/${this.stats.total}]`;

      console.log(`\n${progress} Processing: ${contact.name}`);

      // Skip invalid phone numbers
      if (!contact.normalizedPhone) {
        console.log(`  ❌ Invalid phone number: ${contact.phone}`);
        this.recordResult({
          contact,
          success: false,
          error: "Invalid phone number format",
          attempts: 0,
          timestamp: new Date().toISOString(),
        });
        this.stats.skipped++;
        continue;
      }

      console.log(`  📞 Phone: ${contact.normalizedPhone}`);

      // Send message with retries
      const result = await this.sendWithRetry(contact);
      this.recordResult(result);

      if (result.success) {
        console.log(`  ✅ Sent successfully (ID: ${result.whatsappMessageId})`);
        this.stats.sent++;
      } else {
        console.log(`  ❌ Failed after ${result.attempts} attempts: ${result.error}`);
        this.stats.failed++;
      }

      // Progress summary
      this.printProgress();

      // Rate limiting delay (skip on last message)
      if (i < this.contacts.length - 1) {
        await this.sleep(CONFIG.MESSAGE_DELAY_MS);
      }
    }

    this.printFinalReport();
    this.saveResults();
  }

  /**
   * Send a message with retry logic
   */
  private async sendWithRetry(contact: Contact): Promise<SendResult> {
    let lastError = "";
    
    for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`  🔄 Retry attempt ${attempt}/${CONFIG.MAX_RETRIES}`);
          await this.sleep(CONFIG.RETRY_DELAY_MS);
        }

        const result = await sendWhatsAppTemplate(
          contact.normalizedPhone!,
          CONFIG.TEMPLATE_NAME,
          CONFIG.TEMPLATE_BODY_VARIABLES,
          CONFIG.HEADER_IMAGE_URL,
        );

        if (result.success) {
          return {
            contact,
            success: true,
            whatsappMessageId: result.whatsappMessageId,
            attempts: attempt,
            timestamp: new Date().toISOString(),
          };
        }

        lastError = result.error || "Unknown error";
      } catch (err: any) {
        lastError = err.message || "Network error";
        console.log(`  ⚠️  Attempt ${attempt} failed: ${lastError}`);
      }
    }

    return {
      contact,
      success: false,
      error: lastError,
      attempts: CONFIG.MAX_RETRIES,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Record result and log errors
   */
  private recordResult(result: SendResult): void {
    this.results.push(result);

    if (!result.success) {
      const errorLog = `[${result.timestamp}] ${result.contact.name} (${result.contact.normalizedPhone || result.contact.phone}): ${result.error}\n`;
      this.appendToErrorLog(errorLog);
    }
  }

  /**
   * Print progress bar
   */
  private printProgress(): void {
    const processed = this.stats.sent + this.stats.failed + this.stats.skipped;
    const percentage = ((processed / this.stats.total) * 100).toFixed(1);
    
    console.log(`  📊 Progress: ${percentage}% | ✅ ${this.stats.sent} | ❌ ${this.stats.failed} | ⏭️  ${this.stats.skipped}`);
  }

  /**
   * Print final report
   */
  private printFinalReport(): void {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    
    console.log("\n" + "═".repeat(80));
    console.log("📋 FINAL REPORT");
    console.log("═".repeat(80));
    console.log(`⏱️  Total time: ${duration}s`);
    console.log(`📊 Total contacts: ${this.stats.total}`);
    console.log(`✅ Successfully sent: ${this.stats.sent}`);
    console.log(`❌ Failed: ${this.stats.failed}`);
    console.log(`⏭️  Skipped (invalid): ${this.stats.skipped}`);
    console.log(`📈 Success rate: ${((this.stats.sent / this.stats.total) * 100).toFixed(1)}%`);
    console.log("═".repeat(80));
    
    if (this.stats.failed > 0) {
      console.log(`\n⚠️  Check error log at: ${CONFIG.ERROR_LOG_FILE}`);
    }
    
    console.log(`\n💾 Full results saved to: ${CONFIG.RESULTS_FILE}\n`);
  }

  /**
   * Save results to JSON file
   */
  private saveResults(): void {
    this.ensureLogDir();
    
    const report = {
      metadata: {
        templateName: CONFIG.TEMPLATE_NAME,
        headerImageUrl: CONFIG.HEADER_IMAGE_URL,
        timestamp: new Date().toISOString(),
        duration: ((Date.now() - this.startTime) / 1000).toFixed(2) + "s",
      },
      stats: this.stats,
      results: this.results,
    };

    fs.writeFileSync(
      CONFIG.RESULTS_FILE,
      JSON.stringify(report, null, 2),
      "utf-8"
    );
  }

  /**
   * Append error to log file
   */
  private appendToErrorLog(message: string): void {
    this.ensureLogDir();
    fs.appendFileSync(CONFIG.ERROR_LOG_FILE, message, "utf-8");
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDir(): void {
    if (!fs.existsSync(CONFIG.LOG_DIR)) {
      fs.mkdirSync(CONFIG.LOG_DIR, { recursive: true });
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Execution
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  try {
    // Ensure log directory exists
    if (!fs.existsSync(CONFIG.LOG_DIR)) {
      fs.mkdirSync(CONFIG.LOG_DIR, { recursive: true });
    }

    // Check if CSV exists
    if (!fs.existsSync(CONFIG.CSV_PATH)) {
      console.error(`❌ CSV file not found: ${CONFIG.CSV_PATH}`);
      process.exit(1);
    }

    // Parse contacts
    const contacts = parseCSV(CONFIG.CSV_PATH);

    if (contacts.length === 0) {
      console.error("❌ No valid contacts found in CSV");
      process.exit(1);
    }

    // Confirmation prompt
    console.log(`\n⚠️  You are about to send ${contacts.length} WhatsApp messages.`);
    console.log(`📱 Template: ${CONFIG.TEMPLATE_NAME}`);
    console.log(`🖼️  Header image: ${CONFIG.HEADER_IMAGE_URL}`);
    console.log(
      `✍️  Body params: ${CONFIG.TEMPLATE_BODY_VARIABLES[0]} | ${CONFIG.TEMPLATE_BODY_VARIABLES[1]}`,
    );
    console.log(`\nPress Ctrl+C to cancel, or press Enter to continue...`);

    // Wait for user confirmation
    await new Promise<void>((resolve) => {
      process.stdin.once("data", () => resolve());
    });

    // Create queue and process
    const queue = new MessageQueue(contacts);
    await queue.processQueue();

    console.log("✅ Bulk send completed!\n");
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Fatal error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main();
