const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3001;
const filePath = path.join(__dirname, '..', 'contact-entries.test.txt');

const server = http.createServer(async (req, res) => {
  const allowedOrigin = '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/api/contact') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Contact endpoint is ready.' }));
    return;
  }

  if (req.method === 'GET' && req.url === '/api/contact-entries') {
    try {
      if (!fs.existsSync(filePath)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ entries: [] }));
        return;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const entryRegex = /\[(.*?)\]\s*({[\s\S]*?})\s*(?=\[|$)/g;
      const entries = [];

      for (const match of content.matchAll(entryRegex)) {
        try {
          entries.push({
            timestamp: match[1],
            payload: JSON.parse(match[2].trim())
          });
        } catch {
          continue;
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ entries }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Unable to read entries.' }));
    }
    return;
  }

  if (req.method !== 'POST' || req.url !== '/api/contact') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not found.' }));
    return;
  }

  let rawBody = '';
  req.on('data', chunk => {
    rawBody += chunk;
  });

  req.on('end', () => {
    try {
      const payload = JSON.parse(rawBody || '{}');
      const timestamp = new Date().toISOString();
      const entry = `\n[${timestamp}] ${JSON.stringify(payload, null, 2)}\n`;

      fs.appendFileSync(filePath, entry, 'utf8');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Saved to test file.' }));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid payload.' }));
    }
  });
});

server.listen(port, () => {
  console.log(`Contact form server is running on http://localhost:${port}/api/contact`);
});
