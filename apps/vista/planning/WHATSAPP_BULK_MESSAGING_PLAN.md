# Bulk WhatsApp Messaging Implementation Plan

This plan details the implementation of a Bulk WhatsApp Messaging feature using the Meta WhatsApp Cloud API, integrated into the existing NFC-card manager. It involves using Pre-Approved Message Templates and offloading bulk operations to a background queue system (Upstash QStash) to handle large volumes without hitting Server Action timeouts. It includes support for attaching media such as images or PDFs, hosted on Cloudinary.

## Goal Description

The feature allows administrators to select enrolled users from the NFC Card Manager and send them predefined WhatsApp templates in bulk. The solution utilizes the Next.js App Router for webhooks, server actions to trigger the flow, and a background queue service for reliable bulk message delivery.

## User Review Required

> [!IMPORTANT]
>
> - **Meta App Setup**: You will need an active Meta Developer account, a WhatsApp Business App, a permanent Access Token, a Phone Number ID, a WhatsApp Business Account ID (WABA ID), and **Pre-Approved Message Templates**.
> - **Environment Variables**: New entries required in `.env`: `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_VERIFY_TOKEN`, `UPSTASH_QSTASH_TOKEN` / `UPSTASH_QSTASH_CURRENT_SIGNING_KEY` / `UPSTASH_QSTASH_NEXT_SIGNING_KEY` for the background queue, and `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` for media storage.
> - **New Dependencies**: `@upstash/qstash` (background queue — serverless-friendly, native Vercel/Next.js compatibility) and `cloudinary` (media upload SDK).
> - **Media Uploads**: Media files (images, PDFs) will be uploaded to **Cloudinary** by the frontend to generate a permanent public URL. This URL is then passed to the WhatsApp template payload using Meta's `{ link: mediaUrl }` header structure. This avoids Meta's Media API entirely — no expiring media tokens to manage. Client-side validation will enforce file size limits: **5 MB for images** (`.png`, `.jpg`, `.jpeg`) and **16 MB for documents** (`.pdf`).
> - **Phone Number Validation**: The existing `Card` model's `phone` field is optional and has no format enforcement. A phone number normalization utility will validate and convert numbers to E.164 format (`+1234567890`) before sending. Users with missing or invalid phone numbers will be filtered out and reported to the admin.
> - **Background Queueing**: Vercel/Next.js Server Actions enforce strict execution timeouts (typically 15s to 60s). To process hundreds of users without timing out, the Server Action will hand the job to a background queue, rather than synchronously looping over users.
> - **Ngrok**: For webhooks, during local development, Ngrok must be running to receive replies or status updates.

## Proposed Changes

---

### Meta WhatsApp Utilities

Utilities to interact directly with the Meta Graph API for sending template messages.

#### [NEW] src/lib/whatsapp.ts

- Create utility functions:
  - `sendWhatsAppTemplate(toNumber: string, templateName: string, variables: any[], mediaUrl?: string)`: Constructs and sends the required template payload. If `mediaUrl` is provided, it is included in the template's header component using Meta's `{ link: mediaUrl }` structure (the URL must be publicly accessible — Cloudinary URLs satisfy this). No media upload to Meta is needed.
  - `fetchMessageTemplates()`: Calls `GET /{WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates` to retrieve the list of pre-approved templates and their variable/header definitions. Results are cached in-memory with a short TTL to avoid excessive API calls.
  - `normalizePhoneNumber(phone: string): string | null`: Validates and normalizes a phone string to E.164 format. Returns `null` for invalid/empty numbers.

---

### Message Log Model

A new Mongoose model to persist message delivery history and enable job progress tracking.

#### [NEW] src/models/MessageLog.ts

- Schema fields:
  - `jobId: string` — The background job identifier (indexed).
  - `uuid: string` — The Card UUID of the recipient.
  - `phone: string` — The E.164 phone number used.
  - `templateName: string` — The template that was sent.
  - `status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed'` — Current delivery status (default: `'queued'`).
  - `error: string?` — Error message if the send failed.
  - `whatsappMessageId: string?` — The `wamid` returned by Meta, used to correlate status webhook updates.
  - `sentAt: Date?` — Timestamp when the message was dispatched to Meta.
  - `timestamps: true` — Mongoose auto `createdAt` / `updatedAt`.

---

### API Routes & Webhooks

Routes to handle Meta's verification and incoming data.

#### [NEW] src/app/api/webhook/route.ts

- **GET Handler**: Implements webhook verification using `hub.mode`, `hub.verify_token`, and `hub.challenge`.
- **POST Handler**: Receives incoming messages or status updates (delivery/read receipts) from Meta asynchronously. On receiving a status update, it matches the `whatsappMessageId` in the `MessageLog` collection and updates the `status` field accordingly (e.g., `sent` → `delivered` → `read`, or `failed` with error details).

#### [NEW] src/app/api/jobs/[jobId]/route.ts

- **GET Handler**: Returns the progress of a bulk messaging job by aggregating `MessageLog` entries for the given `jobId`. Response includes:
  - `total`: Total messages in the job.
  - `sent`: Count of messages with status `sent`, `delivered`, or `read`.
  - `failed`: Count of messages with status `failed`.
  - `pending`: Count of messages still `queued`.
  - `failures`: Array of `{ uuid, phone, error }` for failed messages.

#### [NEW] src/app/api/templates/route.ts

- **GET Handler**: Calls `fetchMessageTemplates()` from `src/lib/whatsapp.ts` and returns the list of approved templates with their component definitions (header type, body variables, etc.) so the frontend can render dynamic input fields.

---

### Backend Actions (Server Actions & Queues)

Actions bringing together the UI inputs and dispatching them securely.

#### [MODIFY] src/app/nfc-card/actions.ts

- Add new `dispatchBulkWhatsAppJob(uuids: string[], templateName: string, templateVariables: string[], mediaUrl?: string)` Server Action.
  > **Note**: The parameter is `uuids[]` (not `userIds[]`) to match the existing `Card` model's `uuid` field used throughout the codebase.
  > **Note**: `mediaUrl` is an already-uploaded Cloudinary public URL passed from the frontend. The server action does **not** handle file uploads — that is done client-side before calling this action.
- The action will:
  1. Validate the admin session via `getSession()`.
  2. Fetch all Cards matching the provided `uuids` and validate their phone numbers using `normalizePhoneNumber()`. Collect a list of skipped users (missing/invalid phone) to return to the client.
  3. Generate a unique `jobId` (e.g., `nanoid()`).
  4. Create `MessageLog` entries with status `'queued'` for each valid recipient.
  5. Dispatch the background job to **Upstash QStash** containing the `jobId`, valid `uuids`, `templateName`, `templateVariables`, and `mediaUrl` (if provided).
  6. Return `{ jobId, totalQueued, skippedUsers[] }` to the client immediately.

#### [NEW] src/app/api/queue/bulk-whatsapp/route.ts

- **POST Handler**: The QStash consumer endpoint that processes the bulk job. Verifies the QStash signature for security.
- Processing logic:
  1. Fetches the `phone` numbers for all `uuids` from the database.
  2. Iterates through recipients in configurable batches (default: 50 per batch).
  3. Calls `sendWhatsAppTemplate` for each number (passing `mediaUrl` if present) with a configurable inter-message delay (default: 50ms) to stay within Meta's rate limits (~80 msgs/sec for Cloud API).
  4. On success, updates the `MessageLog` entry to `'sent'` and stores the `whatsappMessageId`.
  5. On failure, updates the `MessageLog` entry to `'failed'` with the error message.
- **Retry policy**: QStash will retry failed queue invocations up to 3 times with exponential backoff. Individual message failures within a batch do **not** halt the batch — they are logged and processing continues.
- **Rate limit handling**: If Meta returns HTTP `429`, the consumer pauses for the duration specified in the `Retry-After` header before resuming.

---

### Frontend UI

Integrating the messaging interface within the NFC Manager, enforcing template rules.

> **Component Decomposition**: The existing `page.tsx` is already ~1,160 lines. To keep it maintainable, the bulk messaging UI will be extracted into dedicated components rather than added inline.

#### [MODIFY] src/app/nfc-card/page.tsx

- Extend the `Enrolled Users` table view to include selection checkboxes for each user.
- Add a "Select All" checkbox in the table header.
- Add a "Compose Bulk Message" floating button that appears when at least one user is selected.
- Import and render the new `<BulkMessageModal>` component, passing selected user UUIDs.
- Display a warning badge on users who have missing or empty phone numbers (they will be skipped during send).

#### [NEW] src/components/nfc/BulkMessageModal.tsx

- A self-contained modal component receiving `selectedUuids: string[]` and an `onClose` callback.
- Contains:
  - Selected recipients count (with count of users that will be skipped due to invalid phone numbers).
  - A Dropdown to select from Pre-Approved Message Templates, populated by calling `GET /api/templates` on mount.
  - Dynamic input fields rendered based on the selected template's variable definitions (e.g., if template body has `{{1}}`, show an input for "Variable 1").
  - File input allowing `.pdf`, `.png`, `.jpg`, `.jpeg` (shown only if the template has a media header component). Client-side validation enforces **5 MB for images** and **16 MB for documents**.
  - **Media upload flow**: When the admin selects a file, the frontend uploads it to **Cloudinary** via the Cloudinary Upload API (using an unsigned upload preset or a signed request via a lightweight `/api/upload-signature` endpoint). On success, the returned public URL is stored in component state. This URL is then passed as `mediaUrl` to the `dispatchBulkWhatsAppJob` server action — the server never handles the raw file.
  - A "Send" button that triggers the `dispatchBulkWhatsAppJob` server action with the template name, variables, selected UUIDs, and the Cloudinary `mediaUrl` (if applicable).
  - On success, displays the `jobId`, count of queued messages, and any skipped users.
  - Transitions to a progress view that polls `GET /api/jobs/[jobId]` every 3 seconds, showing a progress bar and failure list. Polling stops when `pending === 0`.

#### [NEW] src/components/nfc/UserSelectionTable.tsx

- Encapsulates the enrolled users table with built-in checkbox selection logic.
- Props: `cards: CardData[]`, `selectedUuids: string[]`, `onSelectionChange(uuids: string[]): void`.
- Renders selection checkboxes, "Select All", and highlights rows with missing phone numbers.

## Verification Plan

### Automated Tests

- Unit tests for `normalizePhoneNumber()` covering valid E.164 numbers, local formats, empty strings, and invalid inputs.
- Unit tests for `MessageLog` model creation and status transitions.
- Integration test for the QStash consumer endpoint using mocked Meta API responses (success, 429 rate limit, 400 invalid number).

### Manual Verification

1. **Webhook Verification**: Run `ngrok http 3000`, configure the webhook URL in the Meta Developer Dashboard, and verify it successfully connects.
2. **Template Messaging**: Select 1-2 test users in the NFC manager UI, choose a pre-approved template from the dropdown, fill in the template variables, and click Send. Validate receipt on the actual WhatsApp devices.
3. **Media Messaging**: Select a template with a media header, upload an image or PDF (verify client-side size validation rejects files over the limit), and send it to test users. Ensure the media renders correctly on the recipient's phone.
4. **Phone Validation**: Attempt to send to a mix of users — some with valid phone numbers, some with empty/invalid numbers. Confirm the UI reports skipped users and only valid recipients receive messages.
5. **Job Progress Tracking**: After dispatching a bulk job, verify the progress view updates in real time showing sent/failed/pending counts, and that it stops polling when complete.
6. **Rate Limit Handling**: Simulate or trigger a Meta `429` response and confirm the queue consumer pauses and retries without losing messages.
7. **Error Handling**: Ensure errors are displayed gracefully if the WhatsApp API fails (e.g., expired token, invalid template name, network error). Confirm failed messages appear in the job progress view with error details.
8. **Delivery Receipts**: After sending messages, verify that the webhook POST handler updates `MessageLog` entries from `sent` → `delivered` → `read` as status updates arrive from Meta.
