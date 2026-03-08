# Bulk WhatsApp Messaging Script

Queue-based bulk messaging system for sending WhatsApp template messages to contacts from CSV.

## Features

- ✅ **Queue System**: Processes messages sequentially with rate limiting
- 📊 **Progress Tracking**: Real-time progress updates during execution
- 🔄 **Auto Retry**: Automatically retries failed messages up to 3 times
- 📝 **Comprehensive Logging**: Logs all successes and failures
- 💾 **Result Export**: Saves detailed JSON report after completion
- 📞 **Phone Validation**: Automatically validates and normalizes phone numbers
- ⏸️ **Safe Rate Limiting**: 150ms delay between messages to avoid WhatsApp limits

## Prerequisites

1. **Environment Variables**: Ensure your `.env` file has:
   ```env
   WHATSAPP_ACCESS_TOKEN=your_token_here
   WHATSAPP_PHONE_NUMBER_ID=your_phone_id_here
   WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id_here
   ```

2. **CSV File**: Place your contact list CSV at:
   ```
   apps/vista/data/_Contact List 2026 - High Spenders  - GIGI.csv
   ```

3. **CSV Format**: The CSV must have these columns:
   ```csv
   Name:,Contact: 
   John Doe,919876543210
   Jane Smith,+14155551234
   ```

## Usage

### 1. Run the Script

From the `apps/vista` directory:

```bash
pnpm tsx scripts/send-bulk-messages.ts
```

### 2. Review and Confirm

The script will show:
- Total number of contacts to message
- Template name being used
- Header image URL

Press **Enter** to start or **Ctrl+C** to cancel.

### 3. Monitor Progress

The script displays real-time updates:
```
[1/329] Processing: John Doe
  📞 Phone: +919876543210
  ✅ Sent successfully (ID: wamid.xxxxx)
  📊 Progress: 0.3% | ✅ 1 | ❌ 0 | ⏭️  0
```

### 4. Check Results

After completion, results are saved to:
- **`logs/bulk-send-results.json`** - Full detailed report
- **`logs/bulk-send-errors.log`** - Error-only log file

## Configuration

Edit the `CONFIG` object in `send-bulk-messages.ts`:

```typescript
const CONFIG = {
  // CSV file path
  CSV_PATH: path.join(__dirname, "../data/_Contact List 2026 - High Spenders  - GIGI.csv"),
  
  // WhatsApp template details
  TEMPLATE_NAME: "felia_nfc",
  HEADER_IMAGE_URL: "https://your-image-url.com/image.jpg",
  
  // Rate limiting (milliseconds between messages)
  MESSAGE_DELAY_MS: 150,
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,
};
```

## Output Files

### `logs/bulk-send-results.json`

Complete report with metadata, statistics, and per-message results:

```json
{
  "metadata": {
    "templateName": "felia_nfc",
    "headerImageUrl": "https://...",
    "timestamp": "2026-03-07T10:30:00.000Z",
    "duration": "48.52s"
  },
  "stats": {
    "total": 329,
    "sent": 325,
    "failed": 2,
    "skipped": 2
  },
  "results": [
    {
      "contact": {
        "name": "John Doe",
        "phone": "919876543210",
        "normalizedPhone": "+919876543210"
      },
      "success": true,
      "whatsappMessageId": "wamid.xxxxx",
      "attempts": 1,
      "timestamp": "2026-03-07T10:29:12.345Z"
    }
  ]
}
```

### `logs/bulk-send-errors.log`

Simple text log of all failures:

```
[2026-03-07T10:30:00.000Z] Jane Smith (+14155551234): Invalid phone number format
[2026-03-07T10:30:15.000Z] Bob Johnson (+919999999999): Message failed after 3 retries
```

## Phone Number Handling

The script automatically handles various phone number formats:

- ✅ `+919876543210` - E.164 format (preferred)
- ✅ `919876543210` - Without plus sign
- ✅ `9876543210` - 10-digit Indian (adds +91)
- ✅ `09876543210` - With leading 0
- ❌ Invalid formats are skipped

## Rate Limiting

- **Default**: 150ms between messages (~400 messages/minute)
- **WhatsApp Limit**: Up to 80 messages/second for verified businesses
- **Safe Zone**: Current settings ensure you stay well below limits

## Error Handling

The script handles various error scenarios:

1. **Invalid Phone Numbers**: Skipped and logged
2. **Network Errors**: Retried up to 3 times with 2s delay
3. **API Errors**: Logged with full error message
4. **Fatal Errors**: Script exits with error code

## Tips

### Testing First

Create a small test CSV with 2-3 contacts:

```csv
Name:,Contact: 
Test User 1,your_phone_number
Test User 2,another_test_number
```

Run the script to verify everything works before sending to all contacts.

### Monitoring WhatsApp Limits

- Check your WhatsApp Business account for rate limit status
- If you get rate limit errors, increase `MESSAGE_DELAY_MS`
- WhatsApp typically allows ~1000 conversations per day for new businesses

### Resume After Failure

The script logs all results. If interrupted:
1. Check `logs/bulk-send-results.json` for last successful contact
2. Remove sent contacts from CSV
3. Re-run script with remaining contacts

## Troubleshooting

### "Template not found" error

Ensure your template is:
1. Created in WhatsApp Business Manager
2. Approved by Meta
3. Name matches exactly (case-sensitive)

### "Invalid token" error

Check your `.env` file:
- Token is valid and not expired
- Phone number ID is correct
- No extra spaces or quotes

### Messages not received

1. Verify recipient's phone number format
2. Check WhatsApp Business account status
3. Ensure template is approved
4. Check recipient has WhatsApp installed

## Support

For issues related to:
- **Script errors**: Check the error logs in `logs/` directory
- **WhatsApp API**: Visit Meta Developer Dashboard
- **Template issues**: Review template in WhatsApp Business Manager
