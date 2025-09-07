const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/stream' });

console.log(`🔊 Telnyx WebSocket server starting on wss://yourdomain.com:${PORT}/stream`);

wss.on('connection', (ws, req) => {
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
        // Optionally buffer and detect end of utterance

        // DEBUG:
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
