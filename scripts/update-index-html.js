import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const indexPath = path.join(__dirname, '..', 'index.html');

let html = fs.readFileSync(indexPath, 'utf8');

// 1. Replace the SSR product items in lines ~238-264
const ssrPattern = /<div class="flex flex-wrap items-center justify-between gap-2 pt-2\.5 sm:pt-3 border-t border-neutral-100 text-\[11px\] sm:text-xs text-neutral-600">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5 w-full">[\s\S]*?<\/div>\s*<\/section>/;

const newSsrContent = `<div class="flex flex-wrap items-center justify-between gap-2 pt-2.5 sm:pt-3 border-t border-neutral-100 text-[11px] sm:text-xs text-neutral-600">
                <div class="flex items-center gap-1.5 sm:gap-2">
                  <span class="font-semibold text-neutral-900">Curated Collection</span>
                  <span>•</span>
                  <span class="text-emerald-700 font-medium">In stock</span>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5 w-full">
              <div class="p-3 bg-white rounded-2xl border border-neutral-200 flex flex-col justify-between shadow-xs">
                <h3 class="font-bold text-neutral-900 text-xs leading-snug">Gold Plated necklace</h3>
                <div class="text-[11px] text-amber-700 font-medium mt-1">Jewellery • Necklace • ₹99</div>
              </div>
            </div>
          </section>`;

if (ssrPattern.test(html)) {
  html = html.replace(ssrPattern, newSsrContent);
  console.log('Successfully replaced SSR cards in index.html');
} else {
  console.error('Could not match ssrPattern in index.html');
}

// 2. Parse and prune the JSON-LD script tag
const jsonLdStart = '<script type="application/ld+json">';
const jsonLdEnd = '</script>';
const startIndex = html.indexOf(jsonLdStart);

if (startIndex !== -1) {
  const endIndex = html.indexOf(jsonLdEnd, startIndex);
  if (endIndex !== -1) {
    const jsonStr = html.substring(startIndex + jsonLdStart.length, endIndex);
    const parsed = JSON.parse(jsonStr);
    
    // Filter out dummy products from @graph
    const dummyIds = new Set([
      'https://loevraenterprises.publicvm.com/#product-prod-earring-1',
      'https://loevraenterprises.publicvm.com/#product-prod-earring-2',
      'https://loevraenterprises.publicvm.com/#product-prod-earring-3',
      'https://loevraenterprises.publicvm.com/#product-prod-earring-4',
      'https://loevraenterprises.publicvm.com/#product-prod-earring-5',
      'https://loevraenterprises.publicvm.com/#product-prod-tshirt-1',
      'https://loevraenterprises.publicvm.com/#product-prod-tshirt-2',
      'https://loevraenterprises.publicvm.com/#product-prod-tshirt-3',
      'https://loevraenterprises.publicvm.com/#product-prod-tshirt-4',
      'https://loevraenterprises.publicvm.com/#product-prod-tshirt-5',
      'https://loevraenterprises.publicvm.com/#product-prod-lower-1',
      'https://loevraenterprises.publicvm.com/#product-prod-lower-2',
      'https://loevraenterprises.publicvm.com/#product-prod-lower-3',
      'https://loevraenterprises.publicvm.com/#product-prod-lower-4',
      'https://loevraenterprises.publicvm.com/#product-prod-lower-5'
    ]);

    const nonProductGraph = (parsed['@graph'] || []).filter(item => {
      if (item['@type'] === 'Product' && dummyIds.has(item['@id'])) {
        return false;
      }
      return true;
    });

    const singleRealProduct = {
      "@type": "Product",
      "@id": "https://loevraenterprises.publicvm.com/#product-prod-necklace-gold-99",
      "name": "Gold Plated necklace",
      "description": "Handcrafted luxury gold plated necklace with royal finish. Perfect for festive celebrations, weddings, and party occasions.",
      "image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
      "sku": "prod-necklace-gold-99",
      "brand": { "@type": "Brand", "name": "Leovra" },
      "offers": {
        "@type": "Offer",
        "url": "https://loevraenterprises.publicvm.com/?product=prod-necklace-gold-99",
        "priceCurrency": "INR",
        "price": 99,
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": { "@type": "Organization", "name": "Leovra Enterprises" },
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "INR" },
          "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "IN" },
          "deliveryTime": {
            "@type": "ShippingDeliveryTime",
            "handlingTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 2, "unitCode": "DAY" },
            "transitTime": { "@type": "QuantitativeValue", "minValue": 2, "maxValue": 5, "unitCode": "DAY" }
          }
        },
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": "IN",
          "returnPolicyCountry": "IN",
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
          "merchantReturnDays": 3,
          "returnMethod": "https://schema.org/ReturnByMail",
          "returnFees": "https://schema.org/FreeReturn",
          "refundType": "https://schema.org/FullRefund"
        }
      },
      "mpn": "LEO-NECK-001",
      "category": "Jewellery > Necklace",
      "color": "Gold",
      "size": "Free Size",
      "material": "Gold Plated Alloy",
      "pattern": "Royal Gold Plated Necklace"
    };

    nonProductGraph.push(singleRealProduct);
    parsed['@graph'] = nonProductGraph;

    const newJsonStr = JSON.stringify(parsed);
    html = html.substring(0, startIndex + jsonLdStart.length) + newJsonStr + html.substring(endIndex);
    console.log('Successfully updated JSON-LD in index.html');
  }
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Finished updating index.html');
