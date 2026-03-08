#!/usr/bin/env tsx
/**
 * Dry Run - Preview Bulk WhatsApp Messages
 * 
 * Usage:
 *   pnpm bulk-send:dry-run
 * 
 * Shows what messages would be sent without actually sending them.
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load .env file FIRST before importing anything that needs env vars
dotenv.config({ path: path.join(__dirname, "../.env") });

import * as fs from "fs";
import { parse } from "csv-parse/sync";
import { normalizePhoneNumber } from "../src/lib/whatsapp";

// ═══════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  CSV_PATH: path.join(__dirname, "../data/_Contact List 2026 - High Spenders  - Scarlett Bandra.csv"),
  TEMPLATE_NAME: "felia_nfc",
  HEADER_IMAGE_URL: "https://res.cloudinary.com/doyttqu8x/image/upload/v1772821919/whatsapp-media/axx1pmp4va0yji1fsujk.jpg",
  TEMPLATE_BODY_VARIABLES: [
    "Mumbai’s first Cocktail Cinema Bar & European Supper Theatre,",
    "nestled within the iconic Race Course.",
  ],
};

interface Contact {
  name: string;
  phone: string;
  normalizedPhone: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// Parse CSV
// ═══════════════════════════════════════════════════════════════════════════

function parseCSV(filePath: string): Contact[] {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const contacts: Contact[] = [];
  
  for (const record of records) {
    const name = record["Name:"]?.trim();
    const phone = record["Contact:"]?.trim();
    
    if (!name || !phone) continue;

    const normalizedPhone = normalizePhoneNumber(phone);
    
    contacts.push({
      name,
      phone,
      normalizedPhone,
    });
  }

  return contacts;
}

// ═══════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════

function main() {
  console.log("═".repeat(80));
  console.log("🔍 DRY RUN - Bulk WhatsApp Message Preview");
  console.log("═".repeat(80));
  console.log();

  // Check if CSV exists
  if (!fs.existsSync(CONFIG.CSV_PATH)) {
    console.error(`❌ CSV file not found: ${CONFIG.CSV_PATH}`);
    process.exit(1);
  }

  // Parse contacts
  const contacts = parseCSV(CONFIG.CSV_PATH);

  // Statistics
  const validContacts = contacts.filter(c => c.normalizedPhone !== null);
  const invalidContacts = contacts.filter(c => c.normalizedPhone === null);

  console.log("📊 STATISTICS");
  console.log("─".repeat(80));
  console.log(`Total contacts in CSV: ${contacts.length}`);
  console.log(`✅ Valid phone numbers: ${validContacts.length}`);
  console.log(`❌ Invalid phone numbers: ${invalidContacts.length}`);
  console.log();

  // Template info
  console.log("📱 MESSAGE TEMPLATE");
  console.log("─".repeat(80));
  console.log(`Template name: ${CONFIG.TEMPLATE_NAME}`);
  console.log(`Header image: ${CONFIG.HEADER_IMAGE_URL}`);
  console.log(
    `Body parameters: {{1}}="${CONFIG.TEMPLATE_BODY_VARIABLES[0]}", {{2}}="${CONFIG.TEMPLATE_BODY_VARIABLES[1]}"`,
  );
  console.log();

  // Show sample messages
  console.log("📄 SAMPLE MESSAGES (First 10)");
  console.log("─".repeat(80));
  
  const samples = validContacts.slice(0, 10);
  samples.forEach((contact, i) => {
    console.log(`${i + 1}. ${contact.name}`);
    console.log(`   📞 Original: ${contact.phone}`);
    console.log(`   ✅ Normalized: ${contact.normalizedPhone}`);
    console.log(
      `   📨 Template line: "${CONFIG.TEMPLATE_BODY_VARIABLES[0]} ${CONFIG.TEMPLATE_BODY_VARIABLES[1]}"`,
    );
    console.log();
  });

  if (validContacts.length > 10) {
    console.log(`... and ${validContacts.length - 10} more valid contacts`);
    console.log();
  }

  // Show invalid contacts
  if (invalidContacts.length > 0) {
    console.log("⚠️  INVALID CONTACTS (Will be skipped)");
    console.log("─".repeat(80));
    
    invalidContacts.forEach((contact, i) => {
      console.log(`${i + 1}. ${contact.name} - ${contact.phone}`);
    });
    console.log();
  }

  // Estimated time
  const MESSAGE_DELAY_MS = 150;
  const estimatedSeconds = (validContacts.length * MESSAGE_DELAY_MS) / 1000;
  const estimatedMinutes = (estimatedSeconds / 60).toFixed(1);

  console.log("⏱️  ESTIMATED TIME");
  console.log("─".repeat(80));
  console.log(`Estimated duration: ~${estimatedMinutes} minutes (${estimatedSeconds.toFixed(0)}s)`);
  console.log(`Rate: ~${(60000 / MESSAGE_DELAY_MS).toFixed(0)} messages/minute`);
  console.log();

  // Summary
  console.log("═".repeat(80));
  console.log("✅ DRY RUN COMPLETE");
  console.log("═".repeat(80));
  console.log();
  console.log(`📊 Summary:`);
  console.log(`   • ${validContacts.length} messages will be sent`);
  console.log(`   • ${invalidContacts.length} contacts will be skipped`);
  console.log(`   • Estimated time: ~${estimatedMinutes} minutes`);
  console.log();
  console.log("To send for real, run:");
  console.log("   pnpm bulk-send");
  console.log();
}

main();
