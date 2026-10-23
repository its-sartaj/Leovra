import express from 'express';
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const HTTP_PORT = parseInt(process.env.PORT || process.env.HTTP_PORT || '80', 10);
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT || '443', 10);
const HOST = '0.0.0.0'; // BIND TO ALL NETWORK INTERFACES (CRITICAL FOR EXTERNAL / DDNS ACCESS)

// Body parser with 15MB limit to comfortably accept base64 compressed product photos
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// CORS headers for local API testing and headless requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ==========================================
// PERSISTENT DATA STORAGE LAYER (server-data/)
// ==========================================
const dataDir = path.resolve(__dirname, 'server-data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const productsFilePath = path.join(dataDir, 'products.json');
const ordersFilePath = path.join(dataDir, 'orders.json');
const customersFilePath = path.join(dataDir, 'customers.json');

const readJson = (filePath, defaultValue = []) => {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`[DataStore] Error reading ${filePath}:`, err.message);
  }
  return defaultValue;
};

const writeJson = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`[DataStore] Error writing ${filePath}:`, err.message);
    return false;
  }
};

// ==========================================
// REAL-TIME SERVER-SENT EVENTS (SSE) BROADCASTER
// ==========================================
const sseClients = new Set();

const broadcastSse = (type, payload) => {
  const message = `event: message\ndata: ${JSON.stringify({ type, payload, timestamp: Date.now() })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
};

// SSE stream endpoint
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write(': connected\n\n');

  sseClients.add(res);

  // Keep connection alive with heartbeat every 20 seconds
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Health check endpoint
app.get(['/healthz', '/api/health'], (req, res) => {
  const products = readJson(productsFilePath, []);
  const orders = readJson(ordersFilePath, []);
  res.status(200).json({
    status: 'healthy',
    backend: 'Express Node.js',
    productsCount: products.length,
    ordersCount: orders.length,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// 1. PRODUCTS API
app.get('/api/products', (req, res) => {
  const products = readJson(productsFilePath, []);
  res.status(200).json(products);
});

app.post('/api/products', (req, res) => {
  try {
    const payload = req.body;
    let products = readJson(productsFilePath, []);

    if (Array.isArray(payload)) {
      // Full catalog sync / replacement
      products = payload;
    } else if (payload && typeof payload === 'object' && payload.name) {
      // Single product add or update
      const existingIdx = products.findIndex((p) => p.id === payload.id);
      if (existingIdx >= 0) {
        products[existingIdx] = { ...products[existingIdx], ...payload };
      } else {
        const newProduct = {
          ...payload,
          id: payload.id || 'prod-' + Date.now(),
          createdAt: payload.createdAt || new Date().toISOString(),
        };
        products = [newProduct, ...products];
      }
    } else {
      return res.status(400).json({ error: 'Invalid product payload' });
    }

    writeJson(productsFilePath, products);
    broadcastSse('PRODUCTS_UPDATED', products);
    res.status(200).json({ success: true, count: products.length, products });
  } catch (err) {
    console.error('[API Products Error]:', err);
    res.status(500).json({ error: 'Failed to save products' });
  }
});

app.put('/api/products', (req, res) => {
  // Alias to POST
  app.handle(req, res);
});

// 2. ORDERS API
app.get('/api/orders', (req, res) => {
  const orders = readJson(ordersFilePath, []);
  res.status(200).json(orders);
});

app.post('/api/orders', (req, res) => {
  try {
    const orderData = req.body;
    if (!orderData || !orderData.customerName || !orderData.customerPhone || !Array.isArray(orderData.items)) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    const orders = readJson(ordersFilePath, []);
    let products = readJson(productsFilePath, []);

    const newOrder = {
      ...orderData,
      id: orderData.id || 'ORD-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1000).toString(36).toUpperCase(),
      createdAt: orderData.createdAt || new Date().toISOString(),
      status: orderData.status || 'Confirmed',
    };

    // Deduct stock for each item in the order
    if (Array.isArray(orderData.items) && orderData.items.length > 0) {
      products = products.map((prod) => {
        const boughtTotal = orderData.items
          .filter((i) => i.product && i.product.id === prod.id)
          .reduce((sum, i) => sum + (i.quantity || 1), 0);
        if (boughtTotal > 0) {
          const remaining = Math.max(0, prod.stock - boughtTotal);
          return {
            ...prod,
            stock: remaining,
            isOutOfStock: remaining <= 0,
          };
        }
        return prod;
      });
      writeJson(productsFilePath, products);
      broadcastSse('PRODUCTS_UPDATED', products);
    }

    const updatedOrders = [newOrder, ...orders];
    writeJson(ordersFilePath, updatedOrders);
    broadcastSse('ORDERS_UPDATED', updatedOrders);

    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    console.error('[API Create Order Error]:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update single order (e.g. status, AWB, courier, cancel)
app.put('/api/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    let orders = readJson(ordersFilePath, []);
    let products = readJson(productsFilePath, []);

    const targetIdx = orders.findIndex((o) => o.id === id);
    if (targetIdx === -1) {
      return res.status(404).json({ error: `Order #${id} not found` });
    }

    const existingOrder = orders[targetIdx];

    // If order is newly marked Cancelled and restoreInventory requested, restore stock
    if (updates.status === 'Cancelled' && existingOrder.status !== 'Cancelled' && updates.restoreInventory !== false) {
      if (Array.isArray(existingOrder.items) && existingOrder.items.length > 0) {
        products = products.map((prod) => {
          const qtyToRestore = existingOrder.items
            .filter((i) => i.product && i.product.id === prod.id)
            .reduce((sum, i) => sum + (i.quantity || 1), 0);
          if (qtyToRestore > 0) {
            const restored = prod.stock + qtyToRestore;
            return {
              ...prod,
              stock: restored,
              isOutOfStock: false,
            };
          }
          return prod;
        });
        writeJson(productsFilePath, products);
        broadcastSse('PRODUCTS_UPDATED', products);
      }
    }

    const updatedOrder = {
      ...existingOrder,
      ...updates,
      id: existingOrder.id, // prevent id mutation
    };
    orders[targetIdx] = updatedOrder;
    writeJson(ordersFilePath, orders);
    broadcastSse('ORDERS_UPDATED', orders);

    res.status(200).json({ success: true, order: updatedOrder });
  } catch (err) {
    console.error('[API Update Order Error]:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Delete single order
app.delete('/api/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    let orders = readJson(ordersFilePath, []);
    orders = orders.filter((o) => o.id !== id);
    writeJson(ordersFilePath, orders);
    broadcastSse('ORDERS_UPDATED', orders);
    res.status(200).json({ success: true, message: `Order #${id} deleted` });
  } catch (err) {
    console.error('[API Delete Order Error]:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Delete all orders (Admin reset / clean test orders)
app.delete('/api/orders', (req, res) => {
  try {
    writeJson(ordersFilePath, []);
    broadcastSse('ORDERS_UPDATED', []);
    res.status(200).json({ success: true, message: 'All orders have been purged' });
  } catch (err) {
    console.error('[API Clear Orders Error]:', err);
    res.status(500).json({ error: 'Failed to clear orders' });
  }
});

// 3. CUSTOMERS API
app.get('/api/customers', (req, res) => {
  const customers = readJson(customersFilePath, []);
  res.status(200).json(customers);
});

app.post('/api/customers', (req, res) => {
  try {
    const customer = req.body;
    if (!customer || !customer.phone) {
      return res.status(400).json({ error: 'Customer phone required' });
    }
    let customers = readJson(customersFilePath, []);
    const cleanPhone = customer.phone.replace(/\D/g, '').slice(-10);
    const existingIdx = customers.findIndex((c) => c.phone === cleanPhone);

    const record = {
      id: existingIdx >= 0 ? customers[existingIdx].id : 'CUST-' + Date.now(),
      name: customer.name || 'Valued Customer',
      phone: cleanPhone,
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || '',
      createdAt: existingIdx >= 0 ? customers[existingIdx].createdAt : new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      customers[existingIdx] = { ...customers[existingIdx], ...record };
    } else {
      customers.push(record);
    }
    writeJson(customersFilePath, customers);
    res.status(200).json({ success: true, customer: record });
  } catch (err) {
    console.error('[API Customer Error]:', err);
    res.status(500).json({ error: 'Failed to save customer' });
  }
});

// ==========================================
// FRONTEND STATIC DISTRIBUTION & SPA ROUTING
// ==========================================
const distPath = path.resolve(__dirname, 'dist');

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

// SPA Fallback for client-side routing (excluding /api routes)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  if (path.extname(req.path)) {
    return res.status(404).send('Not Found');
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application build not found. Please run npm run build.');
  }
});

// ==========================================
// SERVER INITIALIZATION (HTTP & HTTPS)
// ==========================================
const httpServer = http.createServer(app);
httpServer.listen(HTTP_PORT, HOST, () => {
  console.log(`[HTTP Server] Listening on http://${HOST}:${HTTP_PORT} (All network interfaces)`);
  console.log(`[Backend API] Products, Orders, and SSE Real-time endpoints active.`);
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

// HTTPS Server on 0.0.0.0:443 if SSL certificates are present
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
