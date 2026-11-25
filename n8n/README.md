# n8n Workflows for like a booth

Export-ready workflow templates matching the active definitions in local n8n (`http://localhost:5678`). No credentials or secrets are embedded in these files.

## Included workflows

1. `01-error-notifier.json` — **Notify operator on Like a Booth workflow error** (`Error Trigger` -> Gmail alert). Import and publish this first, then attach it as **Error Workflow** in the settings of workflows 02–04.
2. `02-email-delivery-webhook.json` — **Webhook: send Like a Booth gallery email** (`POST /webhook/like-a-booth/send-email`). Requires a `Header Auth` credential (`X-Like-A-Booth-Secret`) and a `Gmail OAuth2` credential.
3. `03-hourly-blob-cleanup.json` — **Hourly: clean up expired Like a Booth blobs**. Replace the placeholder URL with `https://<your-vercel-domain>/api/delivery/cleanup`, attach a `Custom Auth` credential sending `Authorization: Bearer {{api_key}}` (`CRON_SECRET`), and attach a `Gmail OAuth2` credential for backlog alerts (`more: true`).
4. `04-activity-log-sheets.json` — **Webhook: log Like a Booth activity to Google Sheets** (`POST /webhook/like-a-booth/activity-log`). Requires the same `Header Auth` credential (`X-Like-A-Booth-Secret`) and a `Google Sheets OAuth2` credential pointing at a spreadsheet with a `Logs` tab and header row:
   `timestamp | event | status | mode | session_id | recipient_domain | expires_at | removed | examined`

## Going online

Connect Gmail and Google Sheets OAuth credentials directly on your online HTTPS n8n server (Google OAuth redirect URIs should match the public server URL, not `localhost`), then set `N8N_EMAIL_WEBHOOK_URL`, `N8N_LOG_WEBHOOK_URL`, and `N8N_WEBHOOK_SECRET` in Vercel Environment Variables.
