import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

// LINT.IfChange(aistudio_media_plugin)
function aistudioMediaPlugin(): Plugin {
  return {
    name: 'vite-plugin-aistudio-media',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/assets/aistudio/')) {
          const rawPath = req.url.split('?')[0].split('#')[0];
          try {
            const decodedPath = decodeURIComponent(rawPath);
            const relativePath = decodedPath.replace(/^\//, '');
            const aistudioDir = path.resolve(
              __dirname,
              'public',
              'assets',
              'aistudio',
            );
            const filePath = path.resolve(__dirname, 'public', relativePath);
            if (
              filePath.startsWith(aistudioDir + path.sep) &&
              fs.existsSync(filePath) &&
              fs.statSync(filePath).isFile()
            ) {
              const ext = path.extname(filePath).toLowerCase();
              const mimeMap: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
                '.bmp': 'image/bmp',
                '.ico': 'image/x-icon',
                '.mp4': 'video/mp4',
                '.webm': 'video/webm',
                '.ogv': 'video/ogg',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.ogg': 'audio/ogg',
                '.pdf': 'application/pdf',
              };
              res.setHeader(
                'Content-Type',
                mimeMap[ext] || 'application/octet-stream',
              );
              res.setHeader('Cache-Control', 'no-cache');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          } catch {
            // Fall through if URI decoding or file access fails
          }
        }
        next();
      });
    },
  };
}

/**
 * Embedded Backend API dev server plugin for seamless local dev
 */
function backendDevPlugin(): Plugin {
  return {
    name: 'vite-plugin-backend-dev',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/api')) {
          return next();
        }

        const dataDir = path.resolve(__dirname, 'server-data');
        const readJson = (file: string, def: any = []) => {
          try {
            const p = path.join(dataDir, file);
            if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
          } catch {}
          return def;
        };
        const writeJson = (file: string, data: any) => {
          try {
            const p = path.join(dataDir, file);
            fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
          } catch {}
        };

        const parsedUrl = new URL(req.url, 'http://localhost:3000');
        const pathname = parsedUrl.pathname;

                if (pathname === '/api/admin/login') {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
              try {
                const { passcode } = JSON.parse(body);
                const clean = String(passcode || '').trim();
                if (clean === '7979' || clean === '7979968347' || clean.toLowerCase() === 'admin') {
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({ success: true, token: 'leovra_sec_token_7979_k8v9' }));
                }
              } catch {}
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end('{"success":false,"error":"Invalid passcode"}');
            });
            return;
          }
        }

        if (pathname === '/api/health') {
          const prods = readJson('products.json');
          const ords = readJson('orders.json');
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ status: 'healthy', backend: 'Vite Dev Middleware', productsCount: prods.length, ordersCount: ords.length }));
        }

        if (pathname === '/api/products') {
          if (req.method === 'GET') {
            const prods = readJson('products.json');
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(prods));
          } else if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                if (Array.isArray(parsed)) {
                  writeJson('products.json', parsed);
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({ success: true, count: parsed.length }));
                }
              } catch {}
              res.statusCode = 400;
              res.end('{"error":"Invalid payload"}');
            });
            return;
          }
        }

        if (pathname === '/api/orders') {
          if (req.method === 'GET') {
            const ords = readJson('orders.json');
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(ords));
          } else if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
              try {
                const orderData = JSON.parse(body);
                const ords = readJson('orders.json');
                let prods = readJson('products.json');
                const newOrder = {
                  ...orderData,
                  id: orderData.id || 'ORD-' + Date.now().toString(36).toUpperCase(),
                  createdAt: new Date().toISOString(),
                  status: 'Confirmed'
                };
                if (Array.isArray(orderData.items)) {
                  prods = prods.map((p: any) => {
                    const bought = orderData.items.filter((i: any) => i.product && i.product.id === p.id).reduce((s: number, i: any) => s + (i.quantity || 1), 0);
                    if (bought > 0) {
                      const rem = Math.max(0, p.stock - bought);
                      return { ...p, stock: rem, isOutOfStock: rem <= 0 };
                    }
                    return p;
                  });
                  writeJson('products.json', prods);
                }
                const updatedOrders = [newOrder, ...ords];
                writeJson('orders.json', updatedOrders);
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: true, order: newOrder }));
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          } else if (req.method === 'DELETE') {
            writeJson('orders.json', []);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, message: 'All orders cleared' }));
          }
        }

        if (pathname.startsWith('/api/orders/')) {
          const id = pathname.replace('/api/orders/', '');
          if (req.method === 'PUT') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
              try {
                const updates = JSON.parse(body);
                let ords = readJson('orders.json');
                let prods = readJson('products.json');
                const idx = ords.findIndex((o: any) => o.id === id);
                if (idx >= 0) {
                  if (updates.status === 'Cancelled' && ords[idx].status !== 'Cancelled' && updates.restoreInventory !== false) {
                    prods = prods.map((p: any) => {
                      const restored = (ords[idx].items || []).filter((i: any) => i.product && i.product.id === p.id).reduce((s: number, i: any) => s + (i.quantity || 1), 0);
                      if (restored > 0) return { ...p, stock: p.stock + restored, isOutOfStock: false };
                      return p;
                    });
                    writeJson('products.json', prods);
                  }
                  ords[idx] = { ...ords[idx], ...updates };
                  writeJson('orders.json', ords);
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({ success: true, order: ords[idx] }));
                }
                res.statusCode = 404;
                return res.end('{"error":"Not found"}');
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          } else if (req.method === 'DELETE') {
            let ords = readJson('orders.json');
            ords = ords.filter((o: any) => o.id !== id);
            writeJson('orders.json', ords);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true }));
          }
        }

        next();
      });
    }
  };
}

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  return {
    // Base path: relative './' works on custom domains and github.io subpaths seamlessly
    base: './',
    plugins: [react(), tailwindcss(), ...(isDev ? [aistudioMediaPlugin(), backendDevPlugin()] : [])],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    esbuild: {
      legalComments: 'none',
      drop: isDev ? [] : ['console', 'debugger'],
    },
    build: {
      target: 'es2022',
      cssMinify: true,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'react-core';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'lucide-icons';
            }
          },
        },
      },
    },
  };
});
