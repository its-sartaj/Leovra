import express from 'express';
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const HTTP_PORT = parseInt(process.env.HTTP_PORT || '80', 10);
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT || '443', 10);
const HOST = '0.0.0.0'; // BIND TO ALL NETWORK INTERFACES (CRITICAL FOR EXTERNAL / DDNS ACCESS)

const distPath = path.resolve(__dirname, 'dist');

// Serve static assets from built Vite distribution
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  }));
} else {
  console.warn('[Warning] dist/ folder not found. Run "npm run build" first.');
}

// Health check endpoint for external DDNS monitoring
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// SPA Fallback for client-side routing
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application build not found. Please run npm run build.');
  }
});

// 1. Start HTTP Server on 0.0.0.0:80
const httpServer = http.createServer(app);
httpServer.listen(HTTP_PORT, HOST, () => {
  console.log(`[HTTP Server] Listening on http://${HOST}:${HTTP_PORT} (All network interfaces)`);
});
httpServer.on('error', (err) => {
  if (err.code === 'EACCES') {
    console.error(`[Error] Port ${HTTP_PORT} requires root/administrator privileges. Run with sudo or as Administrator.`);
  } else if (err.code === 'EADDRINUSE') {
    console.error(`[Error] Port ${HTTP_PORT} is already in use by another process.`);
  } else {
    console.error('[Error] HTTP server error:', err);
  }
});

// 2. Start HTTPS Server on 0.0.0.0:443 if SSL certificates are present
const sslPaths = [
  {
    key: process.env.SSL_KEY_PATH || path.join(__dirname, 'ssl', 'privkey.pem'),
    cert: process.env.SSL_CERT_PATH || path.join(__dirname, 'ssl', 'fullchain.pem')
  },
  {
    key: '/etc/letsencrypt/live/loevraenterprises.publicvm.com/privkey.pem',
    cert: '/etc/letsencrypt/live/loevraenterprises.publicvm.com/fullchain.pem'
  }
];

let sslConfig = null;
for (const p of sslPaths) {
  if (fs.existsSync(p.key) && fs.existsSync(p.cert)) {
    try {
      sslConfig = {
        key: fs.readFileSync(p.key),
        cert: fs.readFileSync(p.cert)
      };
      console.log(`[HTTPS Server] Loaded SSL certificates from: ${p.cert}`);
      break;
    } catch (e) {
      console.warn('[HTTPS Server] Error reading SSL certificates:', e.message);
    }
  }
}

if (sslConfig) {
  const httpsServer = https.createServer(sslConfig, app);
  httpsServer.listen(HTTPS_PORT, HOST, () => {
    console.log(`[HTTPS Server] Listening on https://${HOST}:${HTTPS_PORT} (All network interfaces)`);
  });
  httpsServer.on('error', (err) => {
    console.error(`[Error] HTTPS server error on port ${HTTPS_PORT}:`, err.message);
  });
} else {
  console.log(`[HTTPS Notice] No SSL certificates found in ssl/ or Let's Encrypt directory.`);
  console.log(`[HTTPS Notice] To enable HTTPS on port ${HTTPS_PORT}, place fullchain.pem and privkey.pem into ./ssl/ or configure Certbot.`);
}
