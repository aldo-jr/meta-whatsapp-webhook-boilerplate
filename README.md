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
