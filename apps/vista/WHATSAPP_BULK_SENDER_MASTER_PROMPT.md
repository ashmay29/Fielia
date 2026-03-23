# WhatsApp Bulk Sender Master Prompt (Next.js + FastAPI)

You are a senior full-stack engineer. Build a production-grade WhatsApp Bulk Messaging Platform using Next.js for frontend and FastAPI for backend.

## Project goal

Create an admin tool that uploads Excel or CSV contacts, validates and normalizes phone numbers, sends approved WhatsApp template messages in bulk through Meta WhatsApp Cloud API, tracks delivery status, retries failures safely without duplicates, and includes a Replies section with a WhatsApp-like interface.

## Hard requirements

### 1. Tech stack

1. Frontend: Next.js App Router, TypeScript, Tailwind, componentized UI.
2. Backend: FastAPI, Python 3.12+, Pydantic v2, async endpoints.
3. Database: MongoDB for message logs, jobs, and inbound replies.
4. Queue: Redis + Celery or RQ for background processing.
5. Storage: Cloudinary for media upload links.
6. Auth: admin login with protected routes and API authorization.
7. API docs: OpenAPI auto docs from FastAPI.
8. Local dev with Docker Compose.

### 2. WhatsApp messaging behavior

1. Use Meta Cloud API with template messaging only.
2. Support endpoint strategy:
   1. Primary route mode can be marketing or standard.
   2. If marketing fails, fallback to standard automatically.
3. Store for each message:
   1. endpoint_requested
   2. endpoint_used
   3. fallback_used
4. status lifecycle:
   1. queued
   2. sending
   3. sent
   4. delivered
   5. read
   6. failed
5. Save whatsapp_message_id and correlate webhook status updates.
6. Handle rate limits with retry-after/backoff.
7. Respect safe throughput using inter-message delay and batch delay.

### 3. Idempotency and retry rules

1. Must be idempotent per recipient per job.
2. Before sending, atomically claim message row from queued to sending.
3. If a worker crashes, sending rows older than stale timeout are reclaimable.
4. Retrying a failed job must reuse existing rows, not create duplicates.
5. If retry succeeds, same row must transition from failed to sent or delivered or read.
6. Never send duplicate WhatsApp messages for same job and recipient due to queue redelivery.

### 4. Contact import

1. Accept .xlsx, .xls, and .csv uploads.
2. Parse first sheet by default for Excel.
3. Mapping UI for columns:
   1. name
   2. phone
   3. optional variables
4. Validate and normalize phone numbers to E.164.
5. Show skipped contacts with reason:
   1. missing phone
   2. invalid format
   3. duplicate within upload

### 5. Campaign compose and send flow

1. Admin selects template from Meta-approved templates list.
2. Dynamic form renders template variables based on placeholders.
3. If template has media header, allow image or pdf upload.
4. Enforce file limits:
   1. image max 5 MB
   2. pdf max 16 MB
5. Upload media to Cloudinary, pass only public URL to send payload.
6. Dispatch campaign to background queue and immediately return job_id.
7. Show live progress view with polling or websocket:
   1. total
   2. pending
   3. sent
   4. delivered
   5. read
   6. failed
8. Allow download of failed recipients as CSV.
9. Provide retry failed button that enqueues only failed recipients and keeps idempotency guarantees.

### 6. Webhooks

1. Implement webhook verification endpoint.
2. Implement webhook receiver endpoint for:
   1. status updates
   2. inbound user messages
3. Persist inbound replies with:
   1. wa_message_id
   2. from_wa_id
   3. sender profile name
   4. message type
   5. text body when present
   6. raw payload
   7. received_at
4. Always return 200 after receiving webhook payload to avoid unnecessary redelivery loops.
5. Log malformed payloads safely.

### 7. Replies section with WhatsApp-like UI

1. Build an Inbox screen resembling WhatsApp Web:
   1. left pane: conversations list with name, last message, unread badge, timestamp
   2. right pane: message thread bubbles, timestamps, delivery markers
   3. top bar with contact info
   4. bottom composer area
2. Group incoming messages by sender number into conversation threads.
3. Support message type chips for non-text messages.
4. Include search and filter by number or name.
5. Include refresh and auto-refresh options.
6. Mobile responsive behavior:
   1. conversation list collapses when thread opens
   2. back button returns to list

### 8. Data model design

Create models for:

1. CampaignJob
2. MessageLog
3. IncomingMessage
4. ContactImport

Include indexes for:

1. job_id plus status
2. whatsapp_message_id
3. from_wa_id plus received_at
4. created_at

### 9. API endpoints

Implement FastAPI endpoints for:

1. templates list
2. contact import parse and validate
3. campaign create and dispatch
4. job status and metrics
5. retry failed
6. failed export csv
7. inbound replies list and conversation threads
8. webhook verify
9. webhook receive
10. health check

### 10. Frontend pages

Implement Next.js pages/components for:

1. Dashboard with latest campaign insights
2. Compose Campaign modal or page
3. Job Progress panel
4. Failed numbers download and retry actions
5. Inbox and thread view for replies
6. Settings page for integrations and rate-limit tuning

### 11. Security and compliance

1. Add role-based admin access.
2. Store secrets in environment only.
3. Add audit logs for campaign actions.
4. Add opt-in and suppression list support.
5. Prevent sending to blocked or opted-out contacts.
6. Add warning banner for WhatsApp policy compliance and anti-spam rules.

### 12. Observability

1. Structured logs with correlation id per job.
2. Queue worker metrics:
   1. throughput
   2. retry count
   3. failure reasons
3. API error telemetry with clear error codes.
4. Debug endpoints protected for admins only.

### 13. Deliverables

1. Full source code for frontend and backend.
2. Database schema and migration/init scripts.
3. Docker Compose for local setup.
4. Example env files for frontend and backend.
5. Seed script with sample contacts and replies.
6. Postman or Bruno collection.
7. README with setup, webhook setup, local tunnel instructions, and deployment notes.
8. Test suite:
   1. unit tests for phone normalization and status transitions
   2. integration tests for queue idempotency and webhook processing
   3. end-to-end tests for import, send, progress, retry, and inbox rendering

### 14. Quality bar

1. Strict typing and input validation everywhere.
2. Clear separation of concerns between UI, API, worker, and data layers.
3. No monolithic files; use modular components/services.
4. Graceful empty/loading/error states in all screens.
5. Production-ready error handling and retry strategy.

## Implementation instruction

First output a concise architecture plan, then generate the folder structure, then implement backend, then frontend, then tests, then docs. After each phase, list what was built and how to run it.
