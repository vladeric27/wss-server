const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3001;
const AUTH_TOKEN = process.env.AUTH_SECRET || null; // optional

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/stream' });

console.log(`🔊 Telnyx WebSocket server starting on wss://yourdomain.com:${PORT}/stream`);

wss.on('connection', (ws, req) => {
  const { query } = url.parse(req.url, true);

  // 🔒 Optional: check token from ?token=xyz
  if (AUTH_TOKEN && query.token !== AUTH_TOKEN) {
    console.warn('❌ Unauthorized WebSocket connection attempt');
    ws.close(1008, 'Unauthorized');
    return;
  }

  console.log('✅ Telnyx connected:', req.socket.remoteAddress);

  ws.on('message', async (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.event === 'start') {
        console.log('📞 Stream started for call:', data.start.call_sid);
      }

      if (data.event === 'media') {
        const audioChunk = data.media.payload; // base64
        const callSid = data.call_sid;

        // TODO: send this audioChunk to your STT pipeline
        console.log(`[📥] Audio chunk from ${callSid} (base64 size: ${audioChunk.length})`);
      }

      if (data.event === 'stop') {
        console.log('🛑 Stream stopped for call:', data.stop.call_sid);
      }
    } catch (err) {
      console.error('❌ Failed to parse incoming WS message:', err.message);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 WebSocket server ready at wss://yourdomain.com:${PORT}/stream`);
});
