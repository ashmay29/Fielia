import fs from "fs";
import path from "path";

interface IncomingMessage {
  id: string;
  messageId: string;
  from: string;
  senderName: string;
  messageType: string;
  text: string;
  receivedAt: string;
  createdAt: string;
}

async function fetchReplies() {
  console.log("📬 Fetching incoming replies from WhatsApp...\n");

  try {
    const response = await fetch("http://localhost:3000/api/incoming-messages?limit=1000");
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error("Failed to fetch messages");
    }

    console.log(`✅ Found ${data.count} incoming messages (Total: ${data.total})\n`);

    if (data.messages.length === 0) {
      console.log("📭 No replies received yet.");
      return;
    }

    // Sort by received date (newest first)
    const messages: IncomingMessage[] = data.messages.sort(
      (a: IncomingMessage, b: IncomingMessage) =>
        new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
    );

    // Display in console
    console.log("=" .repeat(80));
    console.log("📨 INCOMING REPLIES");
    console.log("=".repeat(80));

    messages.forEach((msg, index) => {
      const date = new Date(msg.receivedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      console.log(`\n[${index + 1}] ${date}`);
      console.log(`From: ${msg.senderName} (${msg.from})`);
      console.log(`Type: ${msg.messageType}`);
      if (msg.text) {
        console.log(`Message: "${msg.text}"`);
      }
      console.log("-".repeat(80));
    });

    // Save to file
    const reportsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const jsonPath = path.join(reportsDir, "incoming-replies.json");
    fs.writeFileSync(jsonPath, JSON.stringify(messages, null, 2));

    // Create CSV
    const csvLines = [
      "Received Date,Sender Name,Phone Number,Message Type,Message Text",
    ];

    messages.forEach((msg) => {
      const date = new Date(msg.receivedAt).toISOString();
      const text = (msg.text || "").replace(/"/g, '""'); // Escape quotes for CSV
      csvLines.push(
        `"${date}","${msg.senderName}","${msg.from}","${msg.messageType}","${text}"`
      );
    });

    const csvPath = path.join(reportsDir, "incoming-replies.csv");
    fs.writeFileSync(csvPath, csvLines.join("\n"));

    console.log("\n📄 Reports saved:");
    console.log(`   - ${jsonPath}`);
    console.log(`   - ${csvPath}`);
    console.log("\n✅ Done!\n");
  } catch (error) {
    console.error("❌ Error fetching replies:", error);
    process.exit(1);
  }
}

fetchReplies();
