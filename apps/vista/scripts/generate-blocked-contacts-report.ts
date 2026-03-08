import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

interface WebhookFailure {
  whatsappMessageId: string;
  recipientPhone: string;
  status: string;
  errorCode: number;
  errorTitle: string;
  errorMessage: string;
  timestamp: string;
}

interface Contact {
  name: string;
  phone: string;
}

interface BlockedContact {
  name: string;
  phone: string;
  errorCode: number;
  errorMessage: string;
}

async function generateBlockedContactsReport() {
  console.log("🔍 Generating blocked contacts report...\n");

  // Read webhook failures
  const webhookFailuresPath = path.join(
    process.cwd(),
    "logs/webhook-failures.json"
  );
  const webhookFailures: WebhookFailure[] = JSON.parse(
    fs.readFileSync(webhookFailuresPath, "utf-8")
  );

  console.log(`📊 Total failed messages: ${webhookFailures.length}`);

  // Filter for error 131049 (healthy ecosystem)
  const ecosystemBlocked = webhookFailures.filter(
    (f) => f.errorCode === 131049
  );
  console.log(
    `🚫 Messages blocked by ecosystem policy (131049): ${ecosystemBlocked.length}\n`
  );

  // Read all CSV files
  const dataDir = path.join(process.cwd(), "data");
  const csvFiles = fs
    .readdirSync(dataDir)
    .filter((f) => f.endsWith(".csv") && !f.startsWith("."));

  console.log(`📁 Reading ${csvFiles.length} CSV files...`);

  // Build phone to name mapping from all CSVs
  const phoneToName = new Map<string, string>();

  for (const csvFile of csvFiles) {
    const csvPath = path.join(dataDir, csvFile);
    const csvContent = fs.readFileSync(csvPath, "utf-8");

    let records;
    try {
      records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (error) {
      console.error(`❌ Error parsing ${csvFile}:`, error);
      continue;
    }

    for (const record of records) {
      // Handle different CSV column formats
      const name =
        record.Name || record["Name:"] || record.name || "Unknown";
      let phone = record.Contact || record["Contact:"] || record.contact || "";

      // Normalize phone: remove spaces, dashes, plus signs
      phone = phone.toString().replace(/[\s\-\+]/g, "");

      // Remove leading country codes if present
      if (phone.startsWith("91") && phone.length > 10) {
        phone = phone.slice(2);
      } else if (phone.startsWith("971") && phone.length > 9) {
        phone = phone.slice(3);
      }

      if (phone) {
        phoneToName.set(phone, name.trim());
      }
    }
  }

  console.log(`✅ Loaded ${phoneToName.size} contacts from CSVs\n`);

  // Match blocked contacts with names
  const blockedContacts: BlockedContact[] = [];
  const unmatchedPhones: string[] = [];

  for (const failure of ecosystemBlocked) {
    // Normalize the phone from webhook
    let phone = failure.recipientPhone.replace(/[\s\-\+]/g, "");

    // Try to match with different variations
    let name = phoneToName.get(phone);

    if (!name) {
      // Try without country code
      if (phone.startsWith("91") && phone.length > 10) {
        name = phoneToName.get(phone.slice(2));
      } else if (phone.startsWith("971") && phone.length > 9) {
        name = phoneToName.get(phone.slice(3));
      }
    }

    if (name) {
      blockedContacts.push({
        name,
        phone: failure.recipientPhone,
        errorCode: failure.errorCode,
        errorMessage: failure.errorMessage,
      });
    } else {
      unmatchedPhones.push(failure.recipientPhone);
    }
  }

  console.log(`✅ Matched ${blockedContacts.length} blocked contacts with names`);
  console.log(`⚠️  ${unmatchedPhones.length} phones couldn't be matched\n`);

  // Sort by name
  blockedContacts.sort((a, b) => a.name.localeCompare(b.name));

  // Save the report
  const reportPath = path.join(process.cwd(), "logs/blocked-contacts-131049.json");
  fs.writeFileSync(reportPath, JSON.stringify(blockedContacts, null, 2));

  // Generate CSV format
  const csvLines = ["Name,Phone Number,Error Code,Error Message"];
  for (const contact of blockedContacts) {
    csvLines.push(
      `"${contact.name}","${contact.phone}",${contact.errorCode},"${contact.errorMessage}"`
    );
  }

  const csvReportPath = path.join(
    process.cwd(),
    "logs/blocked-contacts-131049.csv"
  );
  fs.writeFileSync(csvReportPath, csvLines.join("\n"));

  console.log(`📄 Reports saved to:`);
  console.log(`   - ${reportPath}`);
  console.log(`   - ${csvReportPath}\n`);

  // Summary statistics
  console.log("📊 Summary:");
  console.log(`   Total blocked contacts: ${blockedContacts.length}`);
  console.log(`   Unmatched phones: ${unmatchedPhones.length}`);

  if (unmatchedPhones.length > 0 && unmatchedPhones.length <= 10) {
    console.log("\n⚠️  Unmatched phones:");
    unmatchedPhones.forEach((p) => console.log(`   - ${p}`));
  }

  // Show first 10 blocked contacts as preview
  console.log("\n📋 Preview of blocked contacts (first 10):");
  blockedContacts.slice(0, 10).forEach((c) => {
    console.log(`   ${c.name} - ${c.phone}`);
  });

  if (blockedContacts.length > 10) {
    console.log(`   ... and ${blockedContacts.length - 10} more`);
  }
}

generateBlockedContactsReport().catch(console.error);
