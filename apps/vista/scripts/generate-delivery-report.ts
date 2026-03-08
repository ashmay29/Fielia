#!/usr/bin/env tsx
/**
 * Generate a comprehensive delivery report matching contacts with their delivery status
 */

import * as fs from "fs";
import * as path from "path";

interface BulkSendResult {
  contact: {
    name: string;
    phone: string;
  };
  status: "sent" | "failed" | "skipped";
  whatsappMessageId?: string;
  error?: string;
}

interface WebhookStatus {
  whatsappMessageId: string;
  recipientPhone: string;
  status: "sent" | "delivered" | "read" | "failed";
  errorCode?: number;
  errorTitle?: string;
  errorMessage?: string;
  timestamp: string;
}

async function generateReport() {
  console.log("📊 Generating comprehensive delivery report...\n");

  // Read bulk send results (initial API acceptance)
  const bulkSendPath = path.join(__dirname, "../logs/bulk-send-results.json");
  const bulkSendData = JSON.parse(fs.readFileSync(bulkSendPath, "utf-8"));
  const bulkSendResults = bulkSendData.results || bulkSendData;

  // Read webhook statuses (actual delivery tracking)
  const webhookStatusPath = path.join(__dirname, "../logs/webhook-all-statuses.json");
  const webhookStatuses: WebhookStatus[] = JSON.parse(
    fs.readFileSync(webhookStatusPath, "utf-8")
  );

  // Create a map of phone number to latest webhook status
  const statusByPhone = new Map<string, WebhookStatus>();
  for (const status of webhookStatuses) {
    const existing = statusByPhone.get(status.recipientPhone);
    if (!existing || parseInt(status.timestamp) > parseInt(existing.timestamp)) {
      statusByPhone.set(status.recipientPhone, status);
    }
  }

  // Generate report
  const report: any[] = [];
  const summary = {
    total: bulkSendResults.length,
    delivered: 0,
    read: 0,
    sent: 0, // sent but not yet delivered
    failed: 0,
    noWebhookData: 0,
  };

  for (const result of bulkSendResults) {
    const phone = result.phone.replace(/\D/g, ""); // normalize
    const webhookStatus = statusByPhone.get(phone);

    let finalStatus: string;
    let errorDetails: any = null;

    if (!result.success) {
      finalStatus = "SKIPPED";
      errorDetails = result.error || "Invalid phone number";
    } else if (!webhookStatus) {
      finalStatus = "NO_WEBHOOK_DATA";
      summary.noWebhookData++;
    } else {
      switch (webhookStatus.status) {
        case "delivered":
          finalStatus = "✅ DELIVERED";
          summary.delivered++;
          break;
        case "read":
          finalStatus = "📖 READ";
          summary.read++;
          break;
        case "sent":
          finalStatus = "📤 SENT (not delivered yet)";
          summary.sent++;
          break;
        case "failed":
          finalStatus = "❌ FAILED";
          summary.failed++;
          errorDetails = {
            code: webhookStatus.errorCode,
            message: webhookStatus.errorMessage,
          };
          break;
      }
    }

    report.push({
      name: result.name,
      phone: result.phone,
      status: finalStatus,
      whatsappMessageId: result.whatsappMessageId,
      errorDetails,
    });
  }

  // Sort: failures first, then by name
  report.sort((a, b) => {
    if (a.status.includes("FAILED") && !b.status.includes("FAILED")) return -1;
    if (!a.status.includes("FAILED") && b.status.includes("FAILED")) return 1;
    return a.name.localeCompare(b.name);
  });

  // Save full report
  const reportPath = path.join(__dirname, "../logs/delivery-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Save summary
  const summaryPath = path.join(__dirname, "../logs/delivery-summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  // Print summary
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 COMPLETE DELIVERY REPORT");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Total contacts:              ${summary.total}`);
  console.log(`✅ Successfully delivered:   ${summary.delivered}`);
  console.log(`📖 Read by recipient:        ${summary.read}`);
  console.log(`📤 Sent (not delivered):     ${summary.sent}`);
  console.log(`❌ Failed delivery:          ${summary.failed}`);
  console.log(`⚠️  No webhook data:         ${summary.noWebhookData}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Print failures
  const failures = report.filter((r) => r.status.includes("FAILED"));
  if (failures.length > 0) {
    console.log(`\n❌ FAILED DELIVERIES (${failures.length}):\n`);
    failures.forEach((f, i) => {
      console.log(`${i + 1}. ${f.name} (${f.phone})`);
      if (f.errorDetails) {
        console.log(`   Error ${f.errorDetails.code}: ${f.errorDetails.message}\n`);
      }
    });
  }

  console.log(`\n✅ Full report saved to: logs/delivery-report.json`);
  console.log(`✅ Summary saved to: logs/delivery-summary.json\n`);
}

generateReport().catch(console.error);
