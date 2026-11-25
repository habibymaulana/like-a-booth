# n8n Workflow (1 Unified Flow) for like a booth

Single unified workflow matching `Automate Like a Booth delivery, cleanup, and logging` in local n8n (`http://localhost:5678`). No credentials or secrets are embedded in `like-a-booth-automation.json`.

## 4 branches inside 1 workflow

1. **Email Delivery (`POST /webhook/like-a-booth/send-email`)** — Validates payload and sends a formatted HTML gallery link via Gmail (`200` / `400` / `502`).
2. **Activity Log (`POST /webhook/like-a-booth/activity-log`)** — Validates non-PII delivery events and appends a row to Google Sheets (`Logs` / `Sheet1`).
3. **Hourly Cleanup (`Schedule Every Hour`)** — Calls `http://host.docker.internal:5174/api/delivery/cleanup` (for local Docker) or your hosted `/api/delivery/cleanup` URL.
4. **Built-in Error Alert (`Error Trigger`)** — Fires automatically inside the same workflow if any unhandled failure occurs.

## Local run with `npm run dev:local`

1. `.env.local` (gitignored) configures `DELIVERY_LOCAL_MODE=true` and local secrets (`DELIVERY_SIGNING_SECRET`, `CRON_SECRET`, `N8N_WEBHOOK_SECRET`).
2. In n8n UI (`http://localhost:5678`):
   - Create **Header Auth** (`Like a Booth Webhook Auth`): Name = `X-Like-A-Booth-Secret`, Value = `<N8N_WEBHOOK_SECRET from .env.local>`, attach to both Webhook triggers.
   - Create **Custom Auth** (`Like a Booth Cron Auth`, `httpTemplatedCustomAuth`): Template `{"headers":{"Authorization":"Bearer {{api_key}}"}}` with `<CRON_SECRET from .env.local>`, attach to `Call Local Cleanup`.
   - In Google Sheets (`Logs` -> `Sheet1`), add row 1 headers: `timestamp | event | status | mode | session_id | recipient_domain | expires_at | removed | examined`.
   - Click **Publish** on the workflow.
3. Start the app locally:
   ```sh
   cd /Users/apple/like-a-booth
   npm run dev:local
   ```
   Open `http://127.0.0.1:5174` (or `http://localhost:5174`).
