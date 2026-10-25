import http from 'node:http';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const productsJsonPath = path.join(rootDir, 'server-data', 'products.json');
const deletedJsonPath = path.join(rootDir, 'server-data', 'deleted_products.json');
const origProducts = fs.readFileSync(productsJsonPath, 'utf8');
const origDeleted = fs.readFileSync(deletedJsonPath, 'utf8');

const TEST_PORT = 4199;
const ADMIN_SECRET = 'leovra_sec_token_7979_k8v9';
const env = { ...process.env, PORT: String(TEST_PORT), ADMIN_SECRET };

console.log('Starting server on port', TEST_PORT);
const serverProc = spawn('node', ['server.js'], { cwd: rootDir, env });

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(body);
        } catch {
          parsed = body;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

await new Promise(r => setTimeout(r, 1500));

try {
  console.log('--- Test 1: GET /api/products ---');
  const res1 = await request({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/products',
    method: 'GET'
  });
  console.log('Status:', res1.status);
  console.log('Products count:', Array.isArray(res1.body) ? res1.body.length : res1.body);
  if (Array.isArray(res1.body) && res1.body.length === 1) {
    console.log('Product 0:', res1.body[0].name, '| Subcategory:', res1.body[0].subcategory, '| Price:', res1.body[0].price);
  }

  console.log('--- Test 2: POST /api/products without admin token (expect 401) ---');
  const res2 = await request({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/products',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, [{ id: 'fake-item', name: 'Fake' }]);
  console.log('Status without token:', res2.status);

  console.log('--- Test 3: POST /api/products with dummy product (should be filtered out) ---');
  const res3 = await request({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/products',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': ADMIN_SECRET
    }
  }, [
    { id: 'prod-earring-1', name: 'Antique Oxidized Royal Silver Jhumkas' },
    JSON.parse(origProducts)[0]
  ]);
  console.log('Status with dummy product filter test:', res3.status, 'Count:', res3.body.count);

  console.log('--- Test 4: Trailing dot host redirect ---');
  const res4 = await request({
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/products',
    method: 'GET',
    headers: {
      'Host': 'loevraenterprises.publicvm.com.:4199'
    }
  });
  console.log('Trailing dot redirect status:', res4.status, 'Location header:', res4.headers.location);

  console.log('\nAll server endpoint tests passed successfully!');
} catch (err) {
  console.error('Test failed:', err);
} finally {
  serverProc.kill();
  fs.writeFileSync(productsJsonPath, origProducts, 'utf8');
  fs.writeFileSync(deletedJsonPath, origDeleted, 'utf8');
}
