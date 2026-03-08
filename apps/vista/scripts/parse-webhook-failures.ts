#!/usr/bin/env tsx
/**
 * Parse Next.js development logs for ALL WhatsApp webhook status updates
 * Extracts sent, delivered, read, and failed statuses
 */

import * as fs from "fs";
import * as path from "path";

const logPath = path.join(__dirname, "../.next/dev/logs/next-development.log");

interface MessageStatus {
  whatsappMessageId: string;
  recipientPhone: string;
  status: "sent" | "delivered" | "read" | "failed";
  errorCode?: number;
  errorTitle?: string;
  errorMessage?: string;
  timestamp: string;
}

function parseWebhookLogs() {
  console.log("📖 Reading webhook logs from .next/dev/logs/...\n");

  if (!fs.existsSync(logPath)) {
    console.error(`❌ Log file not found: ${logPath}`);
    console.log("💡 Make sure your Next.js dev server is running to generate logs.\n");
    return;
  }

  const logContent = fs.readFileSync(logPath, "utf-8");
  
  // Extract all JSON payloads from webhook logs
  // The payload is logged as a quoted JSON string with escaped quotes and newlines
  // Format: [Webhook] Received POST payload: "{\"object\":...}"
  const payloadRegex = /\[Webhook\] Received POST payload:\s*"((?:[^"\\]|\\.)*)"/g;
  const matches = [...logContent.matchAll(payloadRegex)];
  
  console.log(`Found ${matches.length} webhook payloads in logs\n`);

  const allStatuses: MessageStatus[] = [];
  
  for (const match of matches) {
    try {
      // Unescape the JSON string
      const escapedPayload = match[1];
      const unescapedPayload = escapedPayload.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      const payload = JSON.parse(unescapedPayload);
      const statuses = extractStatuses(payload);
      allStatuses.push(...statuses);
    } catch (e) {
      // Skip malformed JSON
      console.error("Failed to parse payload:", e);
    }
  }

  // Get latest status for each message (by wamid)
  const latestStatuses = new Map<string, MessageStatus>();
  for (const status of allStatuses) {
    const existing = latestStatuses.get(status.whatsappMessageId);
    if (!existing || parseInt(status.timestamp) > parseInt(existing.timestamp)) {
      latestStatuses.set(status.whatsappMessageId, status);
    }
  }

  const uniqueStatuses = Array.from(latestStatuses.values());
  
  // Count by status
  const byStatus = {
    sent: uniqueStatuses.filter(s => s.status === "sent").length,
    delivered: uniqueStatuses.filter(s => s.status === "delivered").length,
    read: uniqueStatuses.filter(s => s.status === "read").length,
    failed: uniqueStatuses.filter(s => s.status === "failed").length,
  };

  const failures = uniqueStatuses.filter(s => s.status === "failed");

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 COMPLETE DELIVERY STATUS (from Webhooks)`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Total messages tracked:  ${uniqueStatuses.length}`);
  console.log(`✅ Delivered:            ${byStatus.delivered}`);
  console.log(`📖 Read:                 ${byStatus.read}`);
  console.log(`📤 Sent (not yet delivered): ${byStatus.sent}`);
  console.log(`❌ Failed:               ${byStatus.failed}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (failures.length > 0) {
    console.log(`\n❌ FAILED MESSAGES (${failures.length}):`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    failures.forEach((failure, idx) => {
      console.log(`\n${idx + 1}. Phone: ${failure.recipientPhone}`);
      console.log(`   Error ${failure.errorCode}: ${failure.errorTitle}`);
      console.log(`   Time: ${new Date(parseInt(failure.timestamp) * 1000).toISOString()}`);
    });

    // Group by error code
    const byErrorCode = failures.reduce((acc, f) => {
      const code = f.errorCode || 0;
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    console.log(`\n\n📈 FAILURE BREAKDOWN BY ERROR CODE:`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    Object.entries(byErrorCode).forEach(([code, count]) => {
      const example = failures.find(f => f.errorCode === parseInt(code));
      console.log(`\nError ${code}: ${count} failure${count > 1 ? 's' : ''}`);
      console.log(`  → ${example?.errorTitle}`);
    });
  }

  // Save all data
  const logsDir = path.join(__dirname, "../logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Save failures only
  const failuresPath = path.join(logsDir, "webhook-failures.json");
  fs.writeFileSync(failuresPath, JSON.stringify(failures, null, 2), "utf-8");

  // Save all statuses
  const allStatusesPath = path.join(logsDir, "webhook-all-statuses.json");
  fs.writeFileSync(allStatusesPath, JSON.stringify(uniqueStatuses, null, 2), "utf-8");

  // Save summary
  const summaryPath = path.join(logsDir, "webhook-summary.json");
  const summary = {
    timestamp: new Date().toISOString(),
    totalMessages: uniqueStatuses.length,
    statusCounts: byStatus,
    failuresByErrorCode: failures.reduce((acc, f) => {
      const code = f.errorCode || 0;
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {} as Record<number, number>),
  };
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf-8");

  console.log(`\n\n💾 FILES SAVED:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`   ${failuresPath}`);
  console.log(`   ${allStatusesPath}`);
  console.log(`   ${summaryPath}\n`);
}

function extractStatuses(payload: any): MessageStatus[] {
  const statuses: MessageStatus[] = [];

  try {
    const entries = payload?.entry || [];
    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        const statusUpdates = change?.value?.statuses || [];
        for (const status of statusUpdates) {
          if (status.status === "failed" && status.errors) {
            const error = status.errors[0];
            statuses.push({
              whatsappMessageId: status.id,
              recipientPhone: status.recipient_id,
              status: "failed",
              errorCode: error.code,
              errorTitle: error.title,
              errorMessage: error.message,
              timestamp: status.timestamp,
            });
          } else if (["sent", "delivered", "read"].includes(status.status)) {
            statuses.push({
              whatsappMessageId: status.id,
              recipientPhone: status.recipient_id,
              status: status.status,
              timestamp: status.timestamp,
            });
          }
        }
      }
    }
  } catch (e) {
    // Skip malformed payloads
  }

  return statuses;
}

parseWebhookLogs();
