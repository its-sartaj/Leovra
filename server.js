import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { fileURLToPath } from 'url';
import { 
  sendOrderConfirmationEmail, 
  sendTestEmail, 
  getEmailConfig, 
  saveEmailConfig,
  generateOrderInvoiceHtml 
} from './server-email.js';

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-token');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Canonical host redirect (removes trailing dot like loevraenterprises.publicvm.com. to prevent origin splitting)
app.use((req, res, next) => {
  const host = req.headers.host || '';
  const hostParts = host.split(':');
  const hostname = hostParts[0];
  const portPart = hostParts.length > 1 ? `:${hostParts[1]}` : '';
  if (hostname.endsWith('.')) {
    const cleanHostname = hostname.replace(/\.+$/, '');
    const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    return res.redirect(301, `${proto}://${cleanHostname}${portPart}${req.originalUrl}`);
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

// Static product photo extraction directory (Guarantees crawlable JPEG URLs for Google SEO)
const publicProductsDir = path.resolve(__dirname, 'public', 'assets', 'products');
const distProductsDir = path.resolve(__dirname, 'dist', 'assets', 'products');
if (!fs.existsSync(publicProductsDir)) fs.mkdirSync(publicProductsDir, { recursive: true });
if (!fs.existsSync(distProductsDir)) fs.mkdirSync(distProductsDir, { recursive: true });

const extractAndSaveBase64Image = (productId, imageStr) => {
  if (!productId || !imageStr || typeof imageStr !== 'string' || !imageStr.startsWith('data:image/')) return null;
  const matches = imageStr.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
  if (!matches) return null;
  const buffer = Buffer.from(matches[2], 'base64');
  const pubFile = path.join(publicProductsDir, `${productId}.jpg`);
  const distFile = path.join(distProductsDir, `${productId}.jpg`);
  try {
    fs.writeFileSync(pubFile, buffer);
    if (fs.existsSync(distProductsDir)) fs.writeFileSync(distFile, buffer);
    return `/assets/products/${productId}.jpg`;
  } catch (err) {
    console.warn(`[ImageStore] Failed saving product image ${productId}:`, err.message);
    return null;
  }
};

const productsFilePath = path.join(dataDir, 'products.json');
const ordersFilePath = path.join(dataDir, 'orders.json');
const customersFilePath = path.join(dataDir, 'customers.json');
const deletedProductsFilePath = path.join(dataDir, 'deleted_products.json');

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
// ADMIN AUTHENTICATION & SECURITY SHIELD
// ==========================================
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'leovra_sec_token_7979_k8v9';
const VALID_ADMIN_PASSCODES = [
  process.env.ADMIN_PASSCODE || '7979',
  '7979968347',
  'admin'
];

// Admin authorization guard middleware
const requireAdminAuth = (req, res, next) => {
  const token = req.headers['x-admin-token'] || req.headers['authorization']?.replace(/^Bearer\s+/i, '');
  if (!token || token !== ADMIN_SECRET) {
    return res.status(401).json({
      error: 'Unauthorized: Valid Admin Authorization Token required (x-admin-token).'
    });
  }
  next();
};

// Admin authentication endpoint
app.post('/api/admin/login', (req, res) => {
  const { passcode } = req.body || {};
  const clean = String(passcode || '').trim();
  if (clean && VALID_ADMIN_PASSCODES.includes(clean)) {
    return res.status(200).json({
      success: true,
      token: ADMIN_SECRET,
      message: 'Admin authenticated successfully'
    });
  }
  return res.status(401).json({
    success: false,
    error: 'Invalid admin passcode'
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
// Direct Product Image Endpoint (Decodes base64 on-demand or serves static JPEG for Googlebot)
app.get(['/api/products/:id/image', '/api/products/:id/image.jpg', '/assets/products/:id.jpg'], (req, res) => {
  const { id } = req.params;
  const cleanId = id.replace(/\.jpg$/i, '');
  const filePath = path.join(publicProductsDir, `${cleanId}.jpg`);

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    return res.sendFile(filePath);
  }

  // Fallback to checking product database
  const products = readJson(productsFilePath, []);
  const product = products.find(p => p && p.id === cleanId);
  const rawImg = product?.image || product?.images?.[0] || product?.additionalImages?.[0];
  if (rawImg && rawImg.startsWith('data:image/')) {
    extractAndSaveBase64Image(cleanId, rawImg);
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      return res.sendFile(filePath);
    }
  }

  // Category fallback image
  const fallback = path.join(__dirname, 'public', 'assets', 'hero_look_red_stepout.jpg');
  if (fs.existsSync(fallback)) {
    res.setHeader('Content-Type', 'image/jpeg');
    return res.sendFile(fallback);
  }
  res.status(404).send('Image Not Found');
});

app.get('/api/products', (req, res) => {
  const products = readJson(productsFilePath, []);
  const deletedIds = new Set(readJson(deletedProductsFilePath, []));
  const activeProducts = products.filter(p => p && !deletedIds.has(p.id) && !p.deletedAt);
  res.status(200).json(activeProducts);
});

app.post('/api/products', requireAdminAuth, (req, res) => {
  try {
    const payload = req.body;
    let products = readJson(productsFilePath, []);
    const deletedIds = new Set(readJson(deletedProductsFilePath, []));

    if (Array.isArray(payload)) {
      // Full catalog sync / replacement: exclude permanently deleted products
      products = payload.filter(p => p && !deletedIds.has(p.id) && !p.deletedAt);
      products.forEach(p => {
        if (p && p.id) {
          const raw = p.image || p.images?.[0] || p.additionalImages?.[0];
          if (raw) extractAndSaveBase64Image(p.id, raw);
        }
      });
    } else if (payload && typeof payload === 'object' && payload.name) {
      if (deletedIds.has(payload.id)) {
        return res.status(400).json({ error: 'This product has been permanently deleted' });
      }
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
      const targetId = payload.id || products[0].id;
      const raw = payload.image || payload.images?.[0] || payload.additionalImages?.[0];
      if (raw) extractAndSaveBase64Image(targetId, raw);
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

app.delete('/api/products/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    let products = readJson(productsFilePath, []);
    products = products.filter((p) => p.id !== id);
    writeJson(productsFilePath, products);

    // Record tombstone so it can never be resurrected
    let deletedIds = readJson(deletedProductsFilePath, []);
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      writeJson(deletedProductsFilePath, deletedIds);
    }

    broadcastSse('PRODUCTS_UPDATED', products);
    res.status(200).json({ success: true, message: `Product #${id} permanently deleted` });
  } catch (err) {
    console.error('[API Delete Product Error]:', err);
    res.status(500).json({ error: 'Failed to delete product' });
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

app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    const customer = orderData.customer || {};
    const customerName = orderData.customerName || customer.fullName || customer.name || 'Valued Customer';
    const customerPhone = orderData.customerPhone || customer.phone || '';
    const customerEmail = (orderData.customerEmail || customer.email || '').trim();

    if (!orderData || !customerPhone || !Array.isArray(orderData.items)) {
      return res.status(400).json({ error: 'Missing required order fields (customer phone and items list)' });
    }

    const orders = readJson(ordersFilePath, []);
    let products = readJson(productsFilePath, []);

    const date = new Date();
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderNum = orderData.orderNumber || `LC-${date.getFullYear()}-${randomDigits}`;
    const invoiceNum = orderData.invoiceNumber || `INV-LC-${randomDigits}`;

    const newOrder = {
      ...orderData,
      id: orderData.id || 'ORD-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1000).toString(36).toUpperCase(),
      orderNumber: orderNum,
      invoiceNumber: invoiceNum,
      invoiceDate: orderData.invoiceDate || date.toISOString(),
      createdAt: orderData.createdAt || date.toISOString(),
      status: orderData.status || (orderData.paymentMethod === 'upi' ? 'payment_pending' : 'order_placed'),
      customer: {
        fullName: customerName,
        phone: customerPhone,
        email: customerEmail,
        address: orderData.customerAddress || customer.address || '',
        city: orderData.customerCity || customer.city || '',
        pincode: orderData.customerPincode || customer.pincode || '',
        notes: orderData.notes || customer.notes || ''
      }
    };

    // Deduct stock for each item in the order
    if (Array.isArray(orderData.items) && orderData.items.length > 0) {
      products = products.map((prod) => {
        const boughtTotal = orderData.items
          .filter((i) => (i.product && i.product.id === prod.id) || i.productId === prod.id)
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

    // Save or update customer record in customers.json
    if (customerPhone) {
      let customers = readJson(customersFilePath, []);
      const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);
      const existingIdx = customers.findIndex((c) => c.phone === cleanPhone || (customerEmail && c.email === customerEmail));
      const custRecord = {
        id: existingIdx >= 0 ? customers[existingIdx].id : 'CUST-' + Date.now(),
        name: customerName,
        phone: cleanPhone,
        email: customerEmail,
        address: newOrder.customer.address,
        city: newOrder.customer.city,
        createdAt: existingIdx >= 0 ? customers[existingIdx].createdAt : new Date().toISOString(),
      };
      if (existingIdx >= 0) {
        customers[existingIdx] = { ...customers[existingIdx], ...custRecord };
      } else {
        customers.push(custRecord);
      }
      writeJson(customersFilePath, customers);
    }

    // DISPATCH NOTIFICATION AND TAX INVOICE EMAIL TO CUSTOMER'S GMAIL!
    let emailResult = null;
    if (customerEmail) {
      try {
        emailResult = await sendOrderConfirmationEmail(newOrder, customerEmail);
        console.log(`[Order Email] Dispatched to ${customerEmail}:`, emailResult?.success ? 'Success' : emailResult?.error);
      } catch (emErr) {
        console.error('[Order Email Error]:', emErr.message);
        emailResult = { success: false, error: emErr.message };
      }
    }

    res.status(201).json({ 
      success: true, 
      order: newOrder,
      emailNotification: emailResult 
    });
  } catch (err) {
    console.error('[API Create Order Error]:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update single order (e.g. status, AWB, courier, cancel)
app.put('/api/orders/:id', requireAdminAuth, (req, res) => {
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
app.delete('/api/orders/:id', requireAdminAuth, (req, res) => {
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
app.delete('/api/orders', requireAdminAuth, (req, res) => {
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

// 4. GOOGLE AUTH & CUSTOMER AUTO-SIGNUP API
app.post('/api/auth/google', (req, res) => {
  try {
    const { email, name, picture, credential } = req.body || {};
    let finalEmail = email;
    let finalName = name;
    let finalPicture = picture;

    // Decode Google Identity Services (GIS) JWT token if present
    if (credential && (!finalEmail || !finalName)) {
      try {
        const parts = credential.split('.');
        if (parts.length >= 2) {
          const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          finalEmail = decoded.email || finalEmail;
          finalName = decoded.name || finalName;
          finalPicture = decoded.picture || finalPicture;
        }
      } catch (jwtErr) {
        console.warn('[Google Auth] JWT decode notice:', jwtErr.message);
      }
    }

    if (!finalEmail || !finalEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid Gmail or email address required' });
    }

    let customers = readJson(customersFilePath, []);
    const cleanEmail = finalEmail.trim().toLowerCase();
    let existingIdx = customers.findIndex((c) => (c.email || '').toLowerCase() === cleanEmail);

    const userProfile = {
      id: existingIdx >= 0 ? customers[existingIdx].id : 'USER-' + Date.now().toString(36).toUpperCase(),
      name: finalName || cleanEmail.split('@')[0],
      email: cleanEmail,
      picture: finalPicture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(finalName || cleanEmail)}`,
      provider: 'google',
      phone: existingIdx >= 0 ? customers[existingIdx].phone : '',
      address: existingIdx >= 0 ? customers[existingIdx].address : '',
      city: existingIdx >= 0 ? customers[existingIdx].city : '',
      pincode: existingIdx >= 0 ? customers[existingIdx].pincode : '',
      createdAt: existingIdx >= 0 ? customers[existingIdx].createdAt : new Date().toISOString()
    };

    if (existingIdx >= 0) {
      customers[existingIdx] = { ...customers[existingIdx], ...userProfile };
    } else {
      customers.push(userProfile);
    }
    writeJson(customersFilePath, customers);

    res.status(200).json({
      success: true,
      user: userProfile,
      message: 'Google account authenticated & synchronized successfully'
    });
  } catch (err) {
    console.error('[API Google Auth Error]:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// 5. EMAIL NOTIFICATION & INVOICE DISPATCH API
app.post('/api/send-order-email', async (req, res) => {
  try {
    const { order, email } = req.body || {};
    if (!order) {
      return res.status(400).json({ error: 'Order object is required' });
    }
    const targetEmail = (email || order.customer?.email || order.customerEmail || '').trim();
    if (!targetEmail) {
      return res.status(400).json({ error: 'No recipient email specified' });
    }
    const result = await sendOrderConfirmationEmail(order, targetEmail);
    res.status(200).json(result);
  } catch (err) {
    console.error('[API Send Order Email Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to send email' });
  }
});

app.get('/api/orders/:id/invoice-html', (req, res) => {
  const { id } = req.params;
  const orders = readJson(ordersFilePath, []);
  const order = orders.find(o => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).send('Order not found');
  }
  const html = generateOrderInvoiceHtml(order);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

app.get('/api/email-settings', (req, res) => {
  const cfg = getEmailConfig();
  res.status(200).json({
    isConfigured: cfg.isConfigured,
    user: cfg.user,
    hasPassword: Boolean(cfg.pass),
    storeName: cfg.storeName,
    supportEmail: cfg.supportEmail,
    supportPhone: cfg.supportPhone
  });
});

app.post('/api/email-settings', requireAdminAuth, (req, res) => {
  try {
    const { user, pass, storeName, supportEmail, supportPhone } = req.body || {};
    saveEmailConfig({
      user: user !== undefined ? user : undefined,
      pass: pass !== undefined ? pass : undefined,
      storeName: storeName !== undefined ? storeName : undefined,
      supportEmail: supportEmail !== undefined ? supportEmail : undefined,
      supportPhone: supportPhone !== undefined ? supportPhone : undefined
    });
    const cfg = getEmailConfig();
    res.status(200).json({
      success: true,
      message: 'Email settings saved successfully',
      isConfigured: cfg.isConfigured,
      user: cfg.user
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed saving email settings' });
  }
});

app.post('/api/test-email', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Target email address required' });
    }
    const result = await sendTestEmail(email);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Test email failed' });
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
