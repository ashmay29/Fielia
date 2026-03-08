#!/usr/bin/env tsx
/**
 * Send Test WhatsApp Message
 * 
 * Usage:
 *   pnpm tsx scripts/send-test-message.ts
 * 
 * Sends a test template message to a specific number
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load .env file
dotenv.config({ path: path.join(__dirname, "../.env") });

import { sendWhatsAppTemplate, normalizePhoneNumber } from "../src/lib/whatsapp";

// Configuration
const TEST_PHONE = "7977539750"; // Will be normalized to +917977539750
const TEMPLATE_NAME = "felia_nfc";
const TEMPLATE_VARIABLES = [
  "Mumbai's first Cocktail Cinema Bar & European Supper Theatre,",
  "nestled within the iconic Race Course.",
];
const HEADER_IMAGE_URL = "https://res.cloudinary.com/doyttqu8x/image/upload/v1772821919/whatsapp-media/axx1pmp4va0yji1fsujk.jpg";

async function sendTestMessage() {
  console.log("\n" + "═".repeat(80));
  console.log("🧪 SENDING TEST WHATSAPP MESSAGE");
  console.log("═".repeat(80));

  // Normalize phone number
  const normalizedPhone = normalizePhoneNumber(TEST_PHONE);
  
  if (!normalizedPhone) {
    console.error("❌ Invalid phone number:", TEST_PHONE);
    return;
  }

  console.log(`\n📱 Phone Number:          ${TEST_PHONE} → ${normalizedPhone}`);
  console.log(`📧 Template:              ${TEMPLATE_NAME}`);
  console.log(`📸 Header Image:          ${HEADER_IMAGE_URL}`);
  console.log(`📝 Variables:`);
  TEMPLATE_VARIABLES.forEach((v, i) => {
    console.log(`   {{${i + 1}}} = "${v}"`);
  });

  try {
    console.log("\n⏳ Sending message...\n");
    
    // Debug: Log what token is being used (first 20 chars for safety)
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    console.log(`[DEBUG] Token length: ${token?.length}`);
    console.log(`[DEBUG] Token starts with: ${token?.substring(0, 20)}...`);
    console.log(`[DEBUG] Phone ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID}`);
    console.log(`[DEBUG] WABA ID: ${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}\n`);
    
    const result = await sendWhatsAppTemplate(
      normalizedPhone,
      TEMPLATE_NAME,
      TEMPLATE_VARIABLES,
      HEADER_IMAGE_URL
    );

    if (result.success) {
      console.log("\n" + "═".repeat(80));
      console.log("✅ SUCCESS!");
      console.log("═".repeat(80));
      console.log(`📨 Message sent to: ${normalizedPhone}`);
      console.log(`🆔 WhatsApp Message ID: ${result.whatsappMessageId}`);
      console.log("═".repeat(80) + "\n");
    } else {
      console.log("\n" + "═".repeat(80));
      console.log("❌ FAILED!");
      console.log("═".repeat(80));
      console.log(`📱 Recipient: ${normalizedPhone}`);
      console.log(`❌ Error: ${result.error}`);
      console.log("═".repeat(80) + "\n");
    }
  } catch (error: any) {
    console.error("\n❌ Exception:", error.message);
  }
}

sendTestMessage();
