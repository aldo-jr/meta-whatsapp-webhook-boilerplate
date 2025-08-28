const express = require('express');
const https = require('https');

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'YOUR_VERIFY_TOKEN';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || '';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const REPLY_DELAY_MS = Number(process.env.REPLY_DELAY_MS || 2000);
const AUTO_REPLY_TEXT = process.env.AUTO_REPLY_TEXT || 'Thanks for your message!';

function sendWhatsAppText({ to, text, phoneNumberId, token }) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      text: { body: text }
    });

    const path = `/v22.0/${phoneNumberId}/messages`;
    const options = {
      hostname: 'graph.facebook.com',
      method: 'POST',
      path,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        Authorization: `Bearer ${token}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

// Verification endpoint for Meta's webhook challenge
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Endpoint to receive webhook events
app.post('/webhook', (req, res) => {
  console.log('Received webhook event:', JSON.stringify(req.body, null, 2));
  // Always acknowledge quickly
  res.sendStatus(200);

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) {
      return; // Nothing to reply to (e.g., status updates)
    }

    const msg = messages[0];
    const from = msg.from; // sender's WhatsApp ID (phone number)
    const textBody = msg.text?.body;

    // Determine phone number ID to send from: prefer env, fallback to payload metadata
    const phoneNumberId = WHATSAPP_PHONE_NUMBER_ID || value?.metadata?.phone_number_id;
    const token = WHATSAPP_TOKEN;

    if (!phoneNumberId || !token) {
      console.warn('Skipping reply: missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_TOKEN');
      return;
    }

    const replyText = textBody ? `Echo: ${textBody}` : AUTO_REPLY_TEXT;

    setTimeout(async () => {
      try {
        const result = await sendWhatsAppText({
          to: from,
          text: replyText,
          phoneNumberId,
          token
        });
        console.log('Sent reply:', result.status, result.body);
      } catch (err) {
        console.error('Failed to send reply:', err);
      }
    }, REPLY_DELAY_MS);
  } catch (err) {
    console.error('Error handling webhook:', err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server listening on port ' + PORT);
});
