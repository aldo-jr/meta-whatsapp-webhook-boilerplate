# Meta WhatsApp Webhook Boilerplate

A minimal Node.js service exposing a `/webhook` endpoint for Meta's WhatsApp API.

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and set your desired `VERIFY_TOKEN`.
3. Start the server:
   ```
   npm start
   ```

The server listens on `PORT` (default `3000`) and exposes:

- `GET /webhook` for the verification challenge.
- `POST /webhook` to receive incoming webhook events.

## Auto-reply

When a message arrives via `POST /webhook`, the server waits `REPLY_DELAY_MS` milliseconds (default 2000) and sends a reply through the WhatsApp Cloud API.

Set the following in your `.env`:

```
WHATSAPP_TOKEN=YOUR_PERMANENT_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID=YOUR_PHONE_NUMBER_ID
REPLY_DELAY_MS=2000
AUTO_REPLY_TEXT=Thanks for your message!
```

Notes:
- If `WHATSAPP_PHONE_NUMBER_ID` is not set, the server will try to use the `value.metadata.phone_number_id` from the webhook payload.
- The reply text defaults to `Echo: <received text>` when the message is textual; otherwise it uses `AUTO_REPLY_TEXT`.
