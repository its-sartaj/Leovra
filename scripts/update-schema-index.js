import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const indexPath = path.resolve(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const products = [
  {
    id: 'prod-1793455481818',
    title: "LEOVRA Women's Beige & White Dual-Tone Wide Leg Baggy Pants",
    price: 499,
    category: 'womens_lowers',
    stock: 15,
    sku: 'SKU-2297',
    description: "Upgrade your streetwear style with LEOVRA Women's Beige & White Dual-Tone Wide Leg Baggy Pants. Crafted from premium breathable cotton blend with relaxed wide-leg silhouette and elasticated waistband."
  },
  {
    id: 'prod-1793431708770',
    title: "Women's Red & Black Dual-Tone Wide Leg Baggy Track Pants",
    price: 499,
    category: 'womens_lowers',
    stock: 12,
    sku: 'SKU-7181',
    description: "Upgrade your streetwear style with LEOVRA Red & Black Dual-Tone Wide Leg Track Pants. Designed for a bold and trendy look with relaxed baggy fit, elasticated waistband, and comfortable streetwear silhouette."
  },
  {
    id: 'prod-1793395783683',
    title: 'LEOVRA Premium Casual Jogger Pants',
    price: 499,
    category: 'mens_lowers',
    stock: 20,
    sku: 'SKU-1477',
    description: 'High performance everyday athletic and casual jogger pants crafted with stretch cotton twill, ribbed ankle cuffs, and secure deep pockets.'
  },
  {
    id: 'prod-1793357283261',
    title: "LEOVRA Women's Streetwear Joggers",
    price: 499,
    category: 'womens_lowers',
    stock: 18,
    sku: 'SKU-283261',
    description: 'Designed for effortless movement and streetwear aesthetics. Premium cotton fleece joggers with high-rise waistband and tapered ankles.'
  },
  {
    id: 'prod-1793035978851',
    title: 'LEOVRA Relaxed Fit Comfort Lower',
    price: 699,
    category: 'mens_lowers',
    stock: 25,
    sku: 'SKU-978851',
    description: 'Everyday comfort lower engineered with durable soft-touch fabric, elastic drawstring waist, and all-day flexible ease.'
  },
  {
    id: 'prod-tshirt-1',
    title: 'LEOVRA Heavyweight Oversized Graphic Streetwear T-Shirt',
    price: 649,
    category: 'mens_tshirts',
    stock: 22,
    sku: 'SKU-TSHIRT-01',
    description: 'Heavyweight 240 GSM combed cotton oversized streetwear t-shirt with drop-shoulder silhouette, reinforced ribbed crewneck collar, and durable graphic print.'
  },
  {
    id: 'prod-tshirt-2',
    title: 'LEOVRA Minimal Typography Drop-Shoulder T-Shirt',
    price: 499,
    category: 'mens_tshirts',
    stock: 30,
    sku: 'SKU-TSHIRT-02',
    description: '100% bio-washed combed cotton everyday casual streetwear tee with minimalist chest typography and relaxed modern drape.'
  },
  {
    id: 'prod-tshirt-3',
    title: 'LEOVRA Urban Aesthetic Vintage Wash Oversized Tee',
    price: 599,
    category: 'mens_tshirts',
    stock: 16,
    sku: 'SKU-TSHIRT-03',
    description: 'Vintage mineral wash relaxed boxy streetwear t-shirt with retro aesthetic drape, pre-shrunk breathable fabric, and all-day everyday comfort.'
  },
  {
    id: 'prod-1791464881040',
    title: 'Artisanal Golden Plated Necklace',
    price: 299,
    category: 'jewellery',
    stock: 20,
    sku: 'SKU-881040',
    description: 'Handcrafted luxury gold plated necklace with royal finish. Anti-allergic polish, lightweight comfort, and timeless sparkle for festive and celebration wear.'
  }
];

const baseUrl = 'https://loevraenterprises.publicvm.com';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'LEOVRA CLOTHES Streetwear Catalog',
  numberOfItems: products.length,
  itemListElement: products.map((p, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    item: {
      '@type': 'Product',
      '@id': baseUrl + '/#product-' + p.id,
      name: p.title,
      description: p.description,
      image: [
        baseUrl + '/assets/products/' + p.id + '.jpg',
        p.category.includes('jewel') ? baseUrl + '/hero-earring.jpg' : p.category.includes('tshirt') ? baseUrl + '/hero-tshirt.jpg' : baseUrl + '/hero-lowers.jpg'
      ],
      url: baseUrl + '/?product=' + p.id,
      sku: p.sku,
      mpn: p.sku,
      brand: {
        '@type': 'Brand',
        name: 'LEOVRA CLOTHES'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '19',
        bestRating: '5',
        worstRating: '1'
      },
      offers: {
        '@type': 'Offer',
        url: baseUrl + '/?product=' + p.id,
        priceCurrency: 'INR',
        price: p.price,
        priceValidUntil: '2027-12-31',
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: 'LEOVRA CLOTHES',
          url: baseUrl
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: '0',
            currency: 'INR'
          },
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'IN'
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 2,
              unitCode: 'DAY'
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 2,
              maxValue: 5,
              unitCode: 'DAY'
            }
          }
        },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'IN',
          returnPolicyCountry: 'IN',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 7,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn',
          refundType: 'https://schema.org/FullRefund'
        }
      }
    }
  }))
};

const scriptBlock = `    <!-- Google Rich Results & Merchant Listings Product Catalog Schema -->
    <script id="jsonld-product-schema" type="application/ld+json">
${JSON.stringify(schema, null, 2)}
    </script>
`;

if (html.includes('id="jsonld-product-schema"')) {
  html = html.replace(/<script id="jsonld-product-schema"[\s\S]*?<\/script>/, scriptBlock.trim());
} else {
  html = html.replace('  </head>', scriptBlock + '  </head>');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully updated index.html with jsonld-product-schema');
