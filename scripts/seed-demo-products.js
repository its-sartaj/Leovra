/**
 * DEV-ONLY SEED SCRIPT
 * Not bundled into the production app.
 * Usage: node scripts/seed-demo-products.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DEMO_PRODUCTS = [
  {
    id: 'prod-necklace-gold-99',
    name: 'Gold Plated necklace',
    category: 'earrings',
    subcategory: 'Necklace',
    price: 99,
    originalPrice: 299,
    description: 'Handcrafted luxury gold plated necklace with royal finish. Perfect for festive celebrations, weddings, and party occasions.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'
    ],
    stock: 10,
    isOutOfStock: false,
    sizes: ['Free Size'],
    colors: ['Gold'],
    tag: 'Bestseller',
    rating: 5.0,
    reviewCount: 0,
    createdAt: '2025-01-01T10:00:00.000Z'
  }
];

const targetPath = path.resolve(__dirname, '..', 'server-data', 'products.json');
fs.writeFileSync(targetPath, JSON.stringify(DEMO_PRODUCTS, null, 2), 'utf8');
console.log('Seed script finished. Target:', targetPath);
