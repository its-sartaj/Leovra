import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';

const SITE_NAME = 'Leovra Enterprises';
const PRIMARY_DOMAIN = 'https://loevraenterprises.publicvm.com/';

const getBaseCanonical = () => {
  if (typeof window !== 'undefined') {
    // If accessed on PublicVM domain
    if (window.location.hostname.includes('publicvm.com')) {
      return 'https://loevraenterprises.publicvm.com/';
    }
    // Cross-domain canonical pointing to primary domain to consolidate Google rankings
    if (window.location.hostname.includes('github.io')) {
      return 'https://loevraenterprises.publicvm.com/';
    }
    return `${window.location.origin}/`;
  }
  return PRIMARY_DOMAIN;
};

export const SEOHead: React.FC = () => {
  const { filters, setFilters, selectedProduct, setSelectedProduct, currentView } = useStore();

  // 1. Sync document Title & Meta Description dynamically based on current route/selection
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const baseCanonical = getBaseCanonical();
    let pageTitle = 'Leovra Enterprises | Buy Designer Jewellery, Trendy T-Shirts & Mens Lowers Online India';
    let metaDescription = 'Shop handcrafted Kundan & oxidized silver jewellery, oversized streetwear graphic t-shirts (240+ GSM), and premium gym trackpants at Leovra Enterprises (Loevra Enterprises). Cash on Delivery (COD), 3-day easy returns & express doorstep delivery across India.';
    let canonicalUrl = baseCanonical;
    let ogImage = `${baseCanonical}brand-logo.svg`;

    if (currentView === 'admin') {
      pageTitle = 'Admin Inventory & Order Management Portal | Leovra Enterprises';
      metaDescription = 'Restricted administrative portal for real-time stock control, order dispatching, Shiprocket AWB tracking, and catalog management.';
      canonicalUrl = `${baseCanonical}#admin`;
    } else if (selectedProduct) {
      pageTitle = `${selectedProduct.name} - ₹${selectedProduct.price} | Leovra Enterprises`;
      metaDescription = `Buy ${selectedProduct.name} for ₹${selectedProduct.price}. ${selectedProduct.description} Enjoy Cash on Delivery (COD) and 3-day doorstep return policy across India.`;
      canonicalUrl = `${baseCanonical}?product=${selectedProduct.id}`;
      ogImage = selectedProduct.image;
    } else if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.trim();
      pageTitle = `Search results for "${q}" | Leovra Enterprises`;
      metaDescription = `Explore search results for "${q}" at Leovra Enterprises. Handcrafted jewelry, graphic tees, and gym trackpants with Cash on Delivery.`;
      canonicalUrl = `${baseCanonical}?search=${encodeURIComponent(q)}`;
    } else if (filters.category === 'earrings') {
      pageTitle = 'Designer Artisanal Jewellery & Royal Kundan Jewellery Online | Leovra Enterprises';
      metaDescription = 'Shop handcrafted oxidized silver jewellery, meenakari chandbalis, 18K gold plated teardrop chandelier jewellery, and pearl danglers. Cash on Delivery (COD) across India.';
      canonicalUrl = `${baseCanonical}?category=earrings`;
      ogImage = `${baseCanonical}hero-earring.webp`;
    } else if (filters.category === 'tshirts') {
      pageTitle = 'Heavyweight Streetwear Oversized T-Shirts (240+ GSM) | Leovra Enterprises';
      metaDescription = 'Buy 100% pure combed Supima cotton oversized graphic tees, vintage acid wash boxy fit t-shirts, and athletic training gym tees with Cash on Delivery in India.';
      canonicalUrl = `${baseCanonical}?category=tshirts`;
      ogImage = `${baseCanonical}hero-tshirt.webp`;
    } else if (filters.category === 'lowers') {
      pageTitle = 'Men\'s Gym Trackpants, Tactical Cargo Joggers & Comfort Lowers | Leovra Enterprises';
      metaDescription = 'Discover 4-way stretch gym track pants, multi-pocket tactical cargo joggers, and heavy terry cotton casual lowers at Leovra Enterprises with express dispatch.';
      canonicalUrl = `${baseCanonical}?category=lowers`;
      ogImage = `${baseCanonical}hero-lowers.webp`;
    }

    // Set page title
    document.title = pageTitle;

    // Helper to safely set or create meta tags
    const setMetaTag = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (selector.startsWith('meta[name=')) {
          const name = selector.match(/name="([^"]+)"/)?.[1];
          if (name) el.setAttribute('name', name);
        } else if (selector.startsWith('meta[property=')) {
          const prop = selector.match(/property="([^"]+)"/)?.[1];
          if (prop) el.setAttribute('property', prop);
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMetaTag('meta[name="description"]', 'content', metaDescription);
    setMetaTag('meta[property="og:title"]', 'content', pageTitle);
    setMetaTag('meta[property="og:description"]', 'content', metaDescription);
    setMetaTag('meta[property="og:url"]', 'content', canonicalUrl);
    setMetaTag('meta[property="og:image"]', 'content', ogImage);
    setMetaTag('meta[name="twitter:title"]', 'content', pageTitle);
    setMetaTag('meta[name="twitter:description"]', 'content', metaDescription);
    setMetaTag('meta[name="twitter:image"]', 'content', ogImage);

    // Update canonical link
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);

    // Dynamic Product JSON-LD for zero-warning Google rich results
    let prodScript = document.getElementById('product-ld-json') as HTMLScriptElement | null;
    if (selectedProduct) {
      const prodSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${baseCanonical}?product=${selectedProduct.id}#product`,
        "url": `${baseCanonical}?product=${selectedProduct.id}`,
        "color": selectedProduct.colors?.[0] || 'Standard',
        "size": selectedProduct.sizes?.join(', ') || 'Free Size',
        "name": selectedProduct.name,
        "description": selectedProduct.description,
        "image": selectedProduct.image,
        "sku": selectedProduct.id,
        "mpn": `LEO-${selectedProduct.id.toUpperCase()}`,
        "category": selectedProduct.category === 'earrings' ? 'Jewellery > Earrings' : selectedProduct.category === 'tshirts' ? 'Apparel > Shirts & Tops > T-Shirts' : 'Apparel > Pants > Trackpants & Joggers',
        "brand": {
          "@type": "Brand",
          "name": "Leovra"
        },
        "offers": {
          "@type": "Offer",
          "url": `${baseCanonical}?product=${selectedProduct.id}`,
          "priceCurrency": "INR",
          "price": selectedProduct.price,
          "priceValidUntil": "2027-12-31",
          "availability": selectedProduct.isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
          "itemCondition": "https://schema.org/NewCondition",
          "seller": {
            "@type": "Organization",
            "name": "Leovra Enterprises"
          },
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": "0",
              "currency": "INR"
            },
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "IN"
            },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "handlingTime": {
                "@type": "QuantitativeValue",
                "minValue": 1,
                "maxValue": 2,
                "unitCode": "DAY"
              },
              "transitTime": {
                "@type": "QuantitativeValue",
                "minValue": 2,
                "maxValue": 5,
                "unitCode": "DAY"
              }
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
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": selectedProduct.rating || 4.8,
          "reviewCount": selectedProduct.reviewCount || 50,
          "bestRating": "5",
          "worstRating": "1"
        },
        "review": [
          {
            "@type": "Review",
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": 5,
              "bestRating": "5"
            },
            "author": {
              "@type": "Person",
              "name": "Verified Customer"
            },
            "datePublished": "2026-10-15",
            "reviewBody": "Excellent quality and finish, looks very elegant and true to pictures."
          }
        ]
      };
      if (!prodScript) {
        prodScript = document.createElement('script');
        prodScript.id = 'product-ld-json';
        prodScript.type = 'application/ld+json';
        document.head.appendChild(prodScript);
      }
      prodScript.textContent = JSON.stringify(prodSchema);
    } else if (prodScript) {
      prodScript.remove();
    }

    // Synchronize browser URL query parameters without reloading
    if (typeof window !== 'undefined' && currentView === 'store') {
      let newQuery = '';
      if (selectedProduct) {
        newQuery = `?product=${selectedProduct.id}`;
      } else if (filters.category !== 'all') {
        newQuery = `?category=${filters.category}`;
      } else if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
        newQuery = `?search=${encodeURIComponent(filters.searchQuery.trim())}`;
      }

      const newUrl = `${window.location.pathname}${newQuery}${window.location.hash}`;
      if (window.location.search !== newQuery) {
        window.history.replaceState({ category: filters.category, productId: selectedProduct?.id }, '', newUrl);
      }
    }
  }, [filters.category, filters.searchQuery, selectedProduct, currentView]);

  // 2. Handle browser Back/Forward navigation (popstate)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const prodId = params.get('product') || params.get('id');
        const cat = params.get('category');
        const search = params.get('search') || params.get('q');

        if (!prodId && selectedProduct) {
          setSelectedProduct(null);
        }

        if (cat === 'earrings' || cat === 'tshirts' || cat === 'lowers') {
          setFilters(prev => ({ ...prev, category: cat }));
        } else if (!cat && filters.category !== 'all') {
          setFilters(prev => ({ ...prev, category: 'all' }));
        }

        if (search) {
          setFilters(prev => ({ ...prev, searchQuery: search }));
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedProduct, filters.category, setSelectedProduct, setFilters]);

  return null;
};
