import { Product, Coupon, StoreSettings, Order } from '../types';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    "id": "sf-01",
    "sku": "SF-M-TEE-001",
    "title": "Classic Heavyweight Cotton Tee",
    "price": 1499,
    "originalPrice": 1999,
    "category": "mens_tshirts",
    "gender": "gents",
    "type": "tshirts",
    "isNew": true,
    "isBestseller": true,
    "isActive": true,
    "stock": 45,
    "image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    "additionalImages": [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "colors": [
      {
        "name": "Navy Charcoal",
        "hex": "#1e293b"
      },
      {
        "name": "Pure White",
        "hex": "#ffffff"
      },
      {
        "name": "Slate Grey",
        "hex": "#475569"
      }
    ],
    "description": "240 GSM organic combed cotton t-shirt built with reinforced shoulder seams and non-shrink collar.",
    "details": [
      "100% Combed Compact Cotton (240 GSM)",
      "Pre-shrunk fabric to prevent post-wash shrinkage",
      "Double-needle stitching at hem and sleeves",
      "Tailored regular streetwear fit"
    ],
    "createdAt": "2026-10-15T10:00:00Z"
  },
  {
    "id": "sf-02",
    "sku": "SF-W-TEE-002",
    "title": "Women's Relaxed Boxy T-Shirt",
    "price": 1399,
    "originalPrice": 1799,
    "category": "womens_tshirts",
    "gender": "ladies",
    "type": "tshirts",
    "isNew": true,
    "isBestseller": true,
    "isActive": true,
    "stock": 32,
    "image": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
    "additionalImages": [
      "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=800&q=80"
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Soft Sand",
        "hex": "#fef08a"
      },
      {
        "name": "Pitch Black",
        "hex": "#000000"
      },
      {
        "name": "Ash White",
        "hex": "#e2e8f0"
      }
    ],
    "description": "Effortless drop-shoulder silhouette designed with ultra-soft breathable jersey weave.",
    "details": [
      "100% Ring-Spun Breathable Jersey (190 GSM)",
      "Clean ribbed crew neckline",
      "Boxy drop-shoulder modern drape",
      "Machine wash cold, air dry recommended"
    ],
    "createdAt": "2026-10-16T11:00:00Z"
  },
  {
    "id": "sf-03",
    "sku": "SF-M-LOW-003",
    "title": "Men's Utility Cargo Jogger Lower",
    "price": 2499,
    "originalPrice": 2999,
    "category": "mens_lowers",
    "gender": "gents",
    "type": "lowers",
    "isNew": false,
    "isBestseller": true,
    "isActive": true,
    "stock": 28,
    "image": "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Graphite",
        "hex": "#3f3f46"
      },
      {
        "name": "Olive Khaki",
        "hex": "#292524"
      },
      {
        "name": "Onyx Black",
        "hex": "#000000"
      }
    ],
    "description": "Comfort stretch twill fabric featuring tapered elasticized cuffs and deep functional zip cargo pockets.",
    "details": [
      "98% Cotton, 2% Spandex stretch twill",
      "6 Multi-functional utility pockets with snap buttons",
      "Elastic waistband with high-tensile drawcords",
      "Gusseted crotch for flexible mobility"
    ],
    "createdAt": "2026-10-14T09:00:00Z"
  },
  {
    "id": "sf-04",
    "sku": "SF-W-LOW-004",
    "title": "Women's High-Rise Fleece Lounge Lower",
    "price": 2199,
    "originalPrice": 2699,
    "category": "womens_lowers",
    "gender": "ladies",
    "type": "lowers",
    "isNew": true,
    "isBestseller": false,
    "isActive": true,
    "stock": 22,
    "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Heather Grey",
        "hex": "#d1d5db"
      },
      {
        "name": "Noir Black",
        "hex": "#18181b"
      }
    ],
    "description": "Brushed interior fleece with adjustable elastic drawcord waistband for supreme all-day ease.",
    "details": [
      "300 GSM brushed fleece with cloud-soft interior",
      "High-waisted fit with wide ribbed waistband",
      "Deep side slash pockets",
      "Stay-in-place elastic ankle cuffs"
    ],
    "createdAt": "2026-10-17T12:00:00Z"
  },
  {
    "id": "sf-05",
    "sku": "SF-M-CAS-005",
    "title": "Men's Oversized Overshirt Casual Jacket",
    "price": 3299,
    "originalPrice": 3999,
    "category": "mens_casual",
    "gender": "gents",
    "type": "casual",
    "isNew": true,
    "isBestseller": true,
    "isActive": true,
    "stock": 18,
    "image": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Dark Indigo",
        "hex": "#0f172a"
      },
      {
        "name": "Desert Dune",
        "hex": "#d4b996"
      }
    ],
    "description": "Heavyweight textured twill overshirt designed for transitional weather layering over essential tees.",
    "details": [
      "100% Heavy Structured Cotton (340 GSM)",
      "Dual chest flap pockets with matte horn buttons",
      "Relaxed drop-shoulder silhouette",
      "Curved hem for casual styling untucked"
    ],
    "createdAt": "2026-10-18T14:00:00Z"
  },
  {
    "id": "sf-06",
    "sku": "SF-W-CAS-006",
    "title": "Women's Relaxed Linen-Blend Casual Shirt",
    "price": 2499,
    "originalPrice": 2999,
    "category": "womens_casual",
    "gender": "ladies",
    "type": "casual",
    "isNew": false,
    "isBestseller": true,
    "isActive": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    "sizes": [
      "S",
      "M",
      "L"
    ],
    "colors": [
      {
        "name": "Muted Rose",
        "hex": "#e11d48"
      },
      {
        "name": "Jet Black",
        "hex": "#111827"
      },
      {
        "name": "Cream Chalk",
        "hex": "#fdfbf7"
      }
    ],
    "description": "Breathable linen-cotton relaxed button-down featuring breezy side slits and mother-of-pearl buttons.",
    "details": [
      "55% French Linen, 45% Organic Cotton",
      "Naturally cooling weave for warm climates",
      "Slightly elongated back hem",
      "Convertible roll-tab sleeves"
    ],
    "createdAt": "2026-10-12T15:00:00Z"
  },
  {
    "id": "sf-07",
    "sku": "SF-M-LOW-007",
    "title": "Men's Tailored French Terry Lower",
    "price": 2299,
    "originalPrice": 2799,
    "category": "mens_lowers",
    "gender": "gents",
    "type": "lowers",
    "isNew": true,
    "isBestseller": false,
    "isActive": true,
    "stock": 35,
    "image": "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Pitch Black",
        "hex": "#000000"
      },
      {
        "name": "Chalk Grey",
        "hex": "#4b5563"
      }
    ],
    "description": "Crafted from breathable 320 GSM French terry loops with ribbed ankle hems and zipped back pocket.",
    "details": [
      "320 GSM 100% Combed Cotton Loopback French Terry",
      "Concealed zip security pocket on right rear",
      "Rib-knit waistband with metal eyelets",
      "No pill, no sag retention"
    ],
    "createdAt": "2026-10-19T08:00:00Z"
  },
  {
    "id": "sf-08",
    "sku": "SF-W-LOW-008",
    "title": "Women's Wide-Leg Linen Casual Lower",
    "price": 2399,
    "originalPrice": 2899,
    "category": "womens_lowers",
    "gender": "ladies",
    "type": "lowers",
    "isNew": false,
    "isBestseller": true,
    "isActive": true,
    "stock": 19,
    "image": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    "sizes": [
      "S",
      "M",
      "L"
    ],
    "colors": [
      {
        "name": "Natural Beige",
        "hex": "#f5f5f4"
      },
      {
        "name": "Warm Taupe",
        "hex": "#78716c"
      }
    ],
    "description": "Airy linen-cotton blend flowing wide silhouette suited for effortless daytime styling and casual dinners.",
    "details": [
      "Flowing wide-leg cut with front pleats",
      "Partially elasticated back waistband",
      "Dual deep in-seam pockets",
      "Lightweight pre-washed drape"
    ],
    "createdAt": "2026-10-10T11:00:00Z"
  },
  {
    "id": "sf-09",
    "sku": "SF-M-TEE-009",
    "title": "Men's Relaxed Fit Essential Pocket Tee",
    "price": 1399,
    "originalPrice": 1799,
    "category": "mens_tshirts",
    "gender": "gents",
    "type": "tshirts",
    "isNew": false,
    "isBestseller": false,
    "isActive": true,
    "stock": 40,
    "image": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Forest Green",
        "hex": "#065f46"
      },
      {
        "name": "Crisp White",
        "hex": "#ffffff"
      }
    ],
    "description": "Subtle spade chest pocket detail, seamless sides, and pre-shrunk washed finish.",
    "details": [
      "210 GSM Combed Cotton",
      "Reinforced spade chest pocket",
      "Tubular knit body (no side-seam friction)",
      "Taped neck and shoulders"
    ],
    "createdAt": "2026-10-11T13:00:00Z"
  },
  {
    "id": "sf-10",
    "sku": "SF-W-TEE-010",
    "title": "Ladies Clean Ribbed Knit T-Shirt",
    "price": 1499,
    "originalPrice": 1899,
    "category": "womens_tshirts",
    "gender": "ladies",
    "type": "tshirts",
    "isNew": true,
    "isBestseller": false,
    "isActive": true,
    "stock": 24,
    "image": "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80",
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "colors": [
      {
        "name": "Charcoal",
        "hex": "#1c1917"
      },
      {
        "name": "Alabaster Cream",
        "hex": "#e7e5e4"
      }
    ],
    "description": "Fine 2x2 stretch ribbed knit fabrication offering flattering contour and supreme breathability.",
    "details": [
      "95% Modal Cotton, 5% Elastane",
      "Contour body fit with micro-ribbed finish",
      "High-stretch non-deforming weave",
      "Ultra silky hand-feel"
    ],
    "createdAt": "2026-10-20T09:30:00Z"
  },
  {
    "id": "sf-11",
    "sku": "SF-M-CAS-011",
    "title": "Men's Daily Stretch Chino Casual Pant",
    "price": 2799,
    "originalPrice": 3299,
    "category": "mens_casual",
    "gender": "gents",
    "type": "casual",
    "isNew": false,
    "isBestseller": true,
    "isActive": true,
    "stock": 15,
    "image": "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=800&q=80",
    "sizes": [
      "30",
      "32",
      "34",
      "36"
    ],
    "colors": [
      {
        "name": "Camel Tan",
        "hex": "#d97706"
      },
      {
        "name": "Midnight Navy",
        "hex": "#1e293b"
      }
    ],
    "description": "Smart-casual essential garment-dyed stretch cotton with clean welt pockets.",
    "details": [
      "Premium stretch sateen cotton blend",
      "Tailored slim-straight leg profile",
      "Horn-effect button closure with YKK metal zip fly",
      "Pre-washed for instant softness"
    ],
    "createdAt": "2026-10-09T14:15:00Z"
  },
  {
    "id": "sf-12",
    "sku": "SF-W-CAS-012",
    "title": "Women's Urban Relaxed Parachute Pant",
    "price": 2599,
    "originalPrice": 3199,
    "category": "womens_casual",
    "gender": "ladies",
    "type": "casual",
    "isNew": true,
    "isBestseller": true,
    "isActive": true,
    "stock": 20,
    "image": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    "sizes": [
      "S",
      "M",
      "L"
    ],
    "colors": [
      {
        "name": "Steel Grey",
        "hex": "#3f3f46"
      },
      {
        "name": "Cloud White",
        "hex": "#f1f5f9"
      }
    ],
    "description": "Lightweight parachute shell styling with toggle bungees at ankles for versatile styling.",
    "details": [
      "Ultra-lightweight crisp nylon-cotton weave",
      "Adjustable bungee cords at leg openings and waistband",
      "Articulated knee darts for effortless volume",
      "Quick-drying and water-repellent finish"
    ],
    "createdAt": "2026-10-21T16:00:00Z"
  },
  {
    "id": "prod-necklace-gold-99",
    "sku": "SKU-PROD-NECKLACE-GOLD-99",
    "title": "Gold Plated necklace",
    "price": 99,
    "originalPrice": 299,
    "category": "jewellery",
    "gender": "unisex",
    "type": "accessories",
    "isNew": false,
    "isBestseller": true,
    "isActive": true,
    "stock": 10,
    "image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    "additionalImages": [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
    ],
    "sizes": [
      "Free Size"
    ],
    "colors": [
      {
        "name": "Gold",
        "hex": "#d4af37"
      }
    ],
    "description": "Handcrafted luxury gold plated necklace with royal finish. Perfect for festive celebrations, weddings, and party occasions.",
    "details": [
      "Premium handcrafted finish",
      "Guaranteed high durability"
    ],
    "createdAt": "2025-01-01T10:00:00.000Z"
  },
  {
    "id": "prod-earring-1",
    "sku": "SKU-PROD-EARRING-1",
    "title": "Antique Oxidized Royal Silver Jhumkas",
    "price": 399,
    "originalPrice": 899,
    "category": "jewellery",
    "gender": "unisex",
    "type": "accessories",
    "isNew": false,
    "isBestseller": true,
    "isActive": true,
    "stock": 14,
    "image": "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=380&q=75&fm=webp",
    "additionalImages": [
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=380&q=75&fm=webp",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80"
    ],
    "sizes": [
      "Free Size"
    ],
    "colors": [
      {
        "name": "Silver",
        "hex": "#c0c0c0"
      },
      {
        "name": "Charcoal",
        "hex": "#121212"
      }
    ],
    "description": "Handcrafted floral motif oxidized silver jhumkas with tiny pearl drops. Hypoallergenic alloy with antique finish, ideal for ethnic wear and festivities.",
    "details": [
      "Premium handcrafted finish",
      "Guaranteed high durability"
    ],
    "createdAt": "2025-01-10T10:00:00Z"
  },
  {
    "id": "prod-earring-2",
    "sku": "SKU-PROD-EARRING-2",
    "title": "18K Gold Plated Emerald Teardrop Earrings",
    "price": 549,
    "originalPrice": 1199,
    "category": "jewellery",
    "gender": "unisex",
    "type": "accessories",
    "isNew": true,
    "isBestseller": false,
    "isActive": true,
    "stock": 8,
    "image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=380&q=75&fm=webp",
    "additionalImages": [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=380&q=75&fm=webp",
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=600&q=80"
    ],
    "sizes": [
      "Free Size"
    ],
    "colors": [
      {
        "name": "Emerald Gold",
        "hex": "#d4af37"
      },
      {
        "name": "Ruby Gold",
        "hex": "#d4af37"
      }
    ],
    "description": "Luxurious teardrop chandelier earrings set with faux Colombian emerald green stones and sparkling cubic zirconia. Light-weight luxury feel.",
    "details": [
      "Premium handcrafted finish",
      "Guaranteed high durability"
    ],
    "createdAt": "2025-01-12T11:30:00Z"
  },
  {
    "id": "prod-earring-3",
    "sku": "SKU-PROD-EARRING-3",
    "title": "Minimalist Geometric Hexagon Studs",
    "price": 249,
    "originalPrice": 499,
    "category": "jewellery",
    "gender": "unisex",
    "type": "accessories",
    "isNew": true,
    "isBestseller": false,
    "isActive": true,
    "stock": 22,
    "image": "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=380&q=75&fm=webp",
    "additionalImages": [
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=380&q=75&fm=webp",
      "https://images.unsplash.com/photo-1611591475817-29807538a7c2?auto=format&fit=crop&w=600&q=80"
    ],
    "sizes": [
      "Free Size"
    ],
    "colors": [
      {
        "name": "Yellow Gold",
        "hex": "#d4af37"
      },
      {
        "name": "Rose Gold",
        "hex": "#d4af37"
      },
      {
        "name": "Silver",
        "hex": "#c0c0c0"
      }
    ],
    "description": "Clean everyday modern hexagon stud earrings crafted in surgical-grade stainless steel with mirror polish. Water-resistant and tarnish-free.",
    "details": [
      "Premium handcrafted finish",
      "Guaranteed high durability"
    ],
    "createdAt": "2025-01-15T09:00:00Z"
  },
  {
    "id": "prod-earring-4",
    "sku": "SKU-PROD-EARRING-4",
    "title": "Kundan Meenakari Chandbali Hoops",
    "price": 699,
    "originalPrice": 1499,
    "category": "jewellery",
    "gender": "unisex",
    "type": "accessories",
    "isNew": false,
    "isBestseller": false,
    "isActive": true,
    "stock": 12,
    "image": "https://images.unsplash.com/photo-1611591475817-29807538a7c2?auto=format&fit=crop&w=380&q=75&fm=webp",
    "additionalImages": [
      "https://images.unsplash.com/photo-1611591475817-29807538a7c2?auto=format&fit=crop&w=380&q=75&fm=webp",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80"
    ],
    "sizes": [
      "Free Size"
    ],
    "colors": [
      {
        "name": "Multi / Pastel",
        "hex": "#121212"
      }
    ],
    "description": "Traditional Rajasthani Kundan crescent chandbali earrings adorned with hand-painted meenakari accents and beaded fringe.",
    "details": [
      "Premium handcrafted finish",
      "Guaranteed high durability"
    ],
    "createdAt": "2025-01-18T14:15:00Z"
  },
  {
    "id": "prod-earring-5",
    "sku": "SKU-PROD-EARRING-5",
    "title": "Freshwater Pearl Baroque Dangler Earrings",
    "price": 499,
    "originalPrice": 999,
    "category": "jewellery",
    "gender": "unisex",
    "type": "accessories",
    "isNew": false,
    "isBestseller": false,
    "isActive": true,
    "stock": 5,
    "image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=380&q=75&fm=webp",
    "additionalImages": [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=380&q=75&fm=webp",
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=600&q=80"
    ],
    "sizes": [
      "Free Size"
    ],
    "colors": [
      {
        "name": "Natural Pearl",
        "hex": "#121212"
      }
    ],
    "description": "Effortlessly chic asymmetric baroque pearl drops suspended from 14K gold-filled micro hoops. Ideal for modern dates and cocktail parties.",
    "details": [
      "Premium handcrafted finish",
      "Guaranteed high durability"
    ],
    "createdAt": "2025-01-20T16:00:00Z"
  },
  {
    "id": "prod-tshirt-1",
    "sku": "SKU-PROD-TSHIRT-1",
    "title": "Heavyweight Streetwear Oversized Graphic Tee",
    "price": 649,
    "originalPrice": 1299,
    "category": "tshirts",
    "gender": "unisex",
    "type": "tshirts",
    "isNew": false,
    "isBestseller": true,
    "isActive": true,
    "stock": 18,
    "image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=380&q=75&fm=webp",
    "additionalImages": [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=380&q=75&fm=webp",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "colors": [
      {
        "name": "Onyx Black",
        "hex": "#121212"
      },
      {
        "name": "Off-White",
        "hex": "#121212"
      },
      {
        "name": "Olive Green",
        "hex": "#121212"
      }
    ],
    "description": "240 GSM heavy combed cotton graphic tee with drop shoulder relaxed fit, high-density chest typography and ribbed crew collar. Pre-shrunk bio-washed.",
    "details": [
      "Premium handcrafted finish",
      "Guaranteed high durability"
    ],
    "createdAt": "2025-01-05T08:00:00Z"
  },
  {
    "id": "prod-tshirt-2",
    "sku": "SKU-PROD-TSHIRT-2",
    "title": "Pure Supima Cotton Minimalist Crewneck",
    "price": 499,
    "originalPrice": 999,
    "category": "tshirts",
    "gender": "unisex",
    "type": "tshirts",
    "isNew": true,
    "isBestseller": false,
    "isActive": true,
    "stock": 25,
    "image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=380&q=75&fm=webp",
    "additionalImages": [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=380&q=75&fm=webp",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80"
    ],
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Classic White",
        "hex": "#121212"
      },
      {
        "name": "Navy Blue",
        "hex": "#121212"
      },
      {
        "name": "Heather Grey",
        "hex": "#121212"
      }
    ],
    "description": "Made from 100% extra-long staple Supima cotton for exceptional softness, breathability, and rich color retention wash after wash.",
    "details": [
      "Premium handcrafted finish",
      "Guaranteed high durability"
    ],
    "createdAt": "2025-01-08T12:00:00Z"
  },
  {
    "id": "prod-tshirt-3",
    "sku": "SKU-PROD-TSHIRT-3",
    "title": "Vintage Acid Wash Boxy Fit T-Shirt",
    "price": 599,
    "originalPrice": 1199,
    "category": "tshirts",
    "gender": "unisex",
    "type": "tshirts",
    "isNew": false,
    "isBestseller": false,
    "isActive": true,
    "stock": 10,
    "image": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=380&q=75&fm=webp",
    "additionalImages": [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=380&q=75&fm=webp",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80"
    ],
    "sizes": [
      "S",
      "M",
      "L"
    ],
    "colors": [
      {
        "name": "Washed Charcoal",
        "hex": "#121212"
      },
      {
        "name": "Vintage Indigo",
        "hex": "#121212"
      }
    ],
    "description": "Custom mineral wash streetwear silhouette with distressed edges and subtle vintage retro faded dye. Comfortable all-day cotton.",
    "details": [
      "Premium handcrafted finish",
      "Guaranteed high durability"
    ],
    "createdAt": "2025-01-14T15:20:00Z"
  },
  {
    "id": "prod-tshirt-4",
    "sku": "SKU-PROD-TSHIRT-4",
    "title": "Classic Honeycomb Pique Polo T-Shirt",
    "price": 699,
    "originalPrice": 1399,
    "category": "tshirts",
    "gender": "unisex",
    "type": "tshirts",
    "isNew": true,
    "isBestseller": false,
    "isActive": true,
    "stock": 15,
    "image": "https://images.unsplash.com/photo-1625910513413-5b8782a46c64?auto=format&fit=crop&w=380&q=75&fm=webp",
    "additionalImages": [
      "https://images.unsplash.com/photo-1625910513413-5b8782a46c64?auto=format&fit=crop&w=380&q=75&fm=webp",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80"
    ],
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Deep Royal Navy",
        "hex": "#121212"
      },
      {
        "name": "Burgundy Red",
        "hex": "#121212"
      }
    ],
    "description": "Premium textured pique cotton polo with contrast collar tipping and reinforced button placket. Suitable for casual and semi-formal wear.",
    "details": [
      "Premium handcrafted finish",
      "Guaranteed high durability"
    ],
    "createdAt": "2025-01-17T11:00:00Z"
  },
  {
    "id": "prod-tshirt-5",
    "sku": "SKU-PROD-TSHIRT-5",
    "title": "Quick-Dry Athletic Performance Training Tee",
    "price": 449,
    "originalPrice": 899,
    "category": "tshirts",
    "gender": "unisex",
    "type": "tshirts",
    "isNew": true,
    "isBestseller": false,
    "isActive": true,
    "stock": 12,
    "image": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=380&q=75&fm=webp",
    "additionalImages": [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=380&q=75&fm=webp",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Stealth Grey",
        "hex": "#121212"
      },
      {
        "name": "Cobalt Blue",
        "hex": "#121212"
      }
    ],
    "description": "Lightweight poly-spandex moisture-wicking workout t-shirt with mesh airflow panels and flatlock anti-chafing seams.",
    "details": [
      "Premium handcrafted finish",
      "Guaranteed high durability"
    ],
    "createdAt": "2025-01-22T09:40:00Z"
  },
  {
    "id": "prod-lower-1",
    "sku": "SKU-PROD-LOWER-1",
    "title": "Multi-Pocket Tactical Cargo Joggers",
    "price": 899,
    "originalPrice": 1799,
    "category": "lowers",
    "gender": "unisex",
    "type": "lowers",
    "isNew": false,
    "isBestseller": true,
    "isActive": true,
    "stock": 16,
    "image": "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=380&q=75&fm=webp",
    "additionalImages": [
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=380&q=75&fm=webp",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80"
    ],
    "sizes": [
      "28-30 (S)",
      "32 (M)",
      "34 (L)",
      "36 (XL)"
    ],
    "colors": [
      {
        "name": "Military Olive",
        "hex": "#121212"
      },
      {
        "name": "Jet Black",
        "hex": "#121212"
      },
      {
        "name": "Khaki Beige",
        "hex": "#121212"
      }
    ],
    "description": "Durable stretch cotton twill cargo pants featuring 6 tactical pockets, elasticated drawstring waistband, and snug cuffed ankles. Perfect casual utility.",
    "details": [
      "Premium handcrafted finish",
      "Guaranteed high durability"
    ],
    "createdAt": "2025-01-07T13:00:00Z"
  },
  {
    "id": "prod-lower-2",
    "sku": "SKU-PROD-LOWER-2",
    "title": "Heavy Terry Cotton Relaxed Fit Trackpants",
    "price": 749,
    "originalPrice": 1499,
    "category": "lowers",
    "gender": "unisex",
    "type": "lowers",
    "isNew": true,
    "isBestseller": false,
    "isActive": true,
    "stock": 19,
    "image": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=380&q=75&fm=webp",
    "additionalImages": [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=380&q=75&fm=webp",
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80"
    ],
    "sizes": [
      "M (30-32)",
      "L (34)",
      "XL (36)"
    ],
    "colors": [
      {
        "name": "Heather Grey",
        "hex": "#121212"
      },
      {
        "name": "Carbon Black",
        "hex": "#121212"
      }
    ],
    "description": "Ultra-soft 320 GSM French terry fleece lowers with deep zip pockets, wide cotton drawcord, and relaxed taper for lounging or travel.",
    "details": [
      "Premium handcrafted finish",
      "Guaranteed high durability"
    ],
    "createdAt": "2025-01-11T14:30:00Z"
  },
  {
    "id": "prod-lower-3",
    "sku": "SKU-PROD-LOWER-3",
    "title": "4-Way Stretch Pro-Fit Gym & Running Lower",
    "price": 599,
    "originalPrice": 1199,
    "category": "lowers",
    "gender": "unisex",
    "type": "lowers",
    "isNew": false,
    "isBestseller": false,
    "isActive": true,
    "stock": 14,
    "image": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=380&q=75&fm=webp",
    "additionalImages": [
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=380&q=75&fm=webp",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Deep Anthracite",
        "hex": "#121212"
      },
      {
        "name": "Midnight Navy",
        "hex": "#121212"
      }
    ],
    "description": "Engineered for gym workouts and athletic training. Sweat-resistant, ultra-elastic, reflective night safety trims, and secure phone zip pocket.",
    "details": [
      "Premium handcrafted finish",
      "Guaranteed high durability"
    ],
    "createdAt": "2025-01-16T18:00:00Z"
  },
  {
    "id": "prod-lower-4",
    "sku": "SKU-PROD-LOWER-4",
    "title": "Streetwear Tapered Ankle-Zip Track Pants",
    "price": 799,
    "originalPrice": 1599,
    "category": "lowers",
    "gender": "unisex",
    "type": "lowers",
    "isNew": true,
    "isBestseller": false,
    "isActive": true,
    "stock": 10,
    "image": "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=380&q=75&fm=webp",
    "additionalImages": [
      "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=380&q=75&fm=webp",
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80"
    ],
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "colors": [
      {
        "name": "Black & White Stripe",
        "hex": "#121212"
      },
      {
        "name": "Black & Red Stripe",
        "hex": "#121212"
      }
    ],
    "description": "Modern slim-taper silhouette with functional ankle zippers, contrast side piping, and breathable cotton blend fabric.",
    "details": [
      "Premium handcrafted finish",
      "Guaranteed high durability"
    ],
    "createdAt": "2025-01-19T10:00:00Z"
  },
  {
    "id": "prod-lower-5",
    "sku": "SKU-PROD-LOWER-5",
    "title": "Everyday Chino-Knit Comfort Casual Lower",
    "price": 699,
    "originalPrice": 1399,
    "category": "lowers",
    "gender": "unisex",
    "type": "lowers",
    "isNew": true,
    "isBestseller": false,
    "isActive": true,
    "stock": 11,
    "image": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=380&q=75&fm=webp",
    "additionalImages": [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=380&q=75&fm=webp",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80"
    ],
    "sizes": [
      "30 (S)",
      "32 (M)",
      "34 (L)",
      "36 (XL)"
    ],
    "colors": [
      {
        "name": "Dune Beige",
        "hex": "#121212"
      },
      {
        "name": "Slate Navy",
        "hex": "#121212"
      }
    ],
    "description": "Smart hybrid between trousers and sweatpants. Clean flat-front look with hidden inner elastic waist and premium woven feel.",
    "details": [
      "Premium handcrafted finish",
      "Guaranteed high durability"
    ],
    "createdAt": "2025-01-23T12:10:00Z"
  }
];

export const DEFAULT_COUPONS: Coupon[] = [
  {
    "id": "c-welcome10",
    "code": "WELCOME10",
    "discountType": "percentage",
    "discountValue": 10,
    "minPurchaseAmount": 999,
    "expiryDate": "2027-12-31",
    "usageLimit": 1000,
    "timesUsed": 42,
    "isActive": true,
    "description": "10% off on your order above Rs. 999"
  },
  {
    "id": "c-leovra200",
    "code": "LEOVRA200",
    "discountType": "fixed",
    "discountValue": 200,
    "minPurchaseAmount": 1999,
    "expiryDate": "2027-12-31",
    "usageLimit": 500,
    "timesUsed": 18,
    "isActive": true,
    "description": "Flat Rs. 200 off on orders above Rs. 1,999"
  },
  {
    "id": "c-festive500",
    "code": "FESTIVE500",
    "discountType": "fixed",
    "discountValue": 500,
    "minPurchaseAmount": 3999,
    "expiryDate": "2027-12-31",
    "usageLimit": 250,
    "timesUsed": 7,
    "isActive": true,
    "description": "Flat Rs. 500 off on shopping above Rs. 3,999"
  }
];

export const DEFAULT_SETTINGS: StoreSettings = {
  "brandName": "LEOVRA CLOTHES",
  "upiId": "9870168023@ptsbi",
  "announcementText": "Free nationwide delivery on orders above Rs. 2,999",
  "heroTitle": "Browse our\nlatest products",
  "heroSubtitle": "Minimalist aesthetics, tailored comfort, and modern silhouettes for everyday streetwear.",
  "heroButtonText": "Shop all",
  "heroImageUrl": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=85",
  "freeShippingThreshold": 2999,
  "standardShippingFee": 199,
  "defaultCourier": "Blue Dart Express",
  "supportEmail": "support@leovraclothes.com",
  "supportPhone": "+91 98701 68023",
  "supportHours": "Mon - Sat: 10:00 AM - 8:00 PM",
  "sevenDayReturnPolicyText": "We offer a transparent 7-Day Return & Exchange Policy measured from the date of package delivery. Merchandise must be unworn, unwashed, in original brand packaging with all tags attached. Returns are verified within 2 business days of arrival at our facility.",
  "shippingPolicyText": "All confirmed orders are packed and dispatched within 24 to 48 business hours. Deliveries typically arrive within 3-5 business days across major metro cities, and 4-7 business days for regional zones. Full real-time shipment tracking is provided with SMS & WhatsApp alerts.",
  "privacyPolicyText": "Your privacy and data security are paramount. We strictly use industry standard 256-bit encryption for order handling and never share or sell customer information to outside advertising networks.",
  "termsText": "By placing an order on LEOVRA CLOTHES, you agree to our catalog terms, return timelines, and verified payment policies. All prices are stated inclusive of applicable taxes."
};

export const DEFAULT_ORDERS: Order[] = [
  {
    "id": "ord-001",
    "orderNumber": "SF-2026-10142",
    "orderDate": "2026-10-23T14:32:00Z",
    "customer": {
      "fullName": "Hamza Tariq",
      "phone": "9876543210",
      "email": "hamza.tariq@example.com",
      "address": "Flat 402, Green Avenue, Model Town",
      "city": "Delhi",
      "pincode": "110009",
      "notes": "Please ring bell twice upon arrival"
    },
    "items": [
      {
        "id": "item-1",
        "productId": "sf-01",
        "title": "Classic Heavyweight Cotton Tee",
        "price": 1499,
        "originalPrice": 1999,
        "image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
        "size": "L",
        "color": "Navy Charcoal",
        "quantity": 1,
        "sku": "SF-M-TEE-001-L-NAVY"
      },
      {
        "id": "item-2",
        "productId": "sf-03",
        "title": "Men's Utility Cargo Jogger Lower",
        "price": 2499,
        "originalPrice": 2999,
        "image": "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80",
        "size": "M",
        "color": "Graphite",
        "quantity": 1,
        "sku": "SF-M-LOW-003-M-GRAPHITE"
      }
    ],
    "subtotal": 3998,
    "discount": 200,
    "couponCode": "LEOVRA200",
    "deliveryCharge": 0,
    "totalAmount": 3798,
    "paymentMethod": "upi",
    "paymentStatus": "pending_verification",
    "upiUtrNumber": "UPI429019284102",
    "status": "payment_pending",
    "statusHistory": [
      {
        "status": "order_placed",
        "timestamp": "2026-10-23T14:32:00Z",
        "note": "Order placed by customer via UPI QR option",
        "updatedBy": "System"
      },
      {
        "status": "payment_pending",
        "timestamp": "2026-10-23T14:33:00Z",
        "note": "Customer submitted UPI UTR: UPI429019284102. Pending Admin verification against 9870168023@ptsbi statement.",
        "updatedBy": "System"
      }
    ],
    "invoiceNumber": "INV-SF-10142",
    "invoiceDate": "2026-10-23T14:32:00Z"
  },
  {
    "id": "ord-002",
    "orderNumber": "SF-2026-10088",
    "orderDate": "2026-10-20T09:15:00Z",
    "customer": {
      "fullName": "Ayesha Khan",
      "phone": "9812345678",
      "email": "ayesha.k@example.com",
      "address": "House 14, 3rd Cross, Indiranagar",
      "city": "Bengaluru",
      "pincode": "560038"
    },
    "items": [
      {
        "id": "item-3",
        "productId": "sf-02",
        "title": "Women's Relaxed Boxy T-Shirt",
        "price": 1399,
        "originalPrice": 1799,
        "image": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
        "size": "S",
        "color": "Soft Sand",
        "quantity": 1,
        "sku": "SF-W-TEE-002-S-SAND"
      },
      {
        "id": "item-4",
        "productId": "sf-04",
        "title": "Women's High-Rise Fleece Lounge Lower",
        "price": 2199,
        "originalPrice": 2699,
        "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
        "size": "M",
        "color": "Heather Grey",
        "quantity": 1,
        "sku": "SF-W-LOW-004-M-GREY"
      }
    ],
    "subtotal": 3598,
    "discount": 360,
    "couponCode": "WELCOME10",
    "deliveryCharge": 0,
    "totalAmount": 3238,
    "paymentMethod": "cod",
    "paymentStatus": "collected",
    "status": "delivered",
    "statusHistory": [
      {
        "status": "order_placed",
        "timestamp": "2026-10-20T09:15:00Z",
        "note": "Order placed by customer via Cash on Delivery",
        "updatedBy": "System"
      },
      {
        "status": "processing",
        "timestamp": "2026-10-20T10:00:00Z",
        "note": "Order verified and sent to warehouse",
        "updatedBy": "Admin"
      },
      {
        "status": "packed",
        "timestamp": "2026-10-20T14:20:00Z",
        "note": "Packed in tamper-proof custom bag",
        "updatedBy": "Warehouse"
      },
      {
        "status": "dispatched",
        "timestamp": "2026-10-21T08:30:00Z",
        "note": "Handed over to Blue Dart Express (AWB: BD84920194)",
        "updatedBy": "Logistics"
      },
      {
        "status": "delivered",
        "timestamp": "2026-10-23T11:45:00Z",
        "note": "Delivered to recipient. COD collected: Rs. 3,238.",
        "updatedBy": "Courier"
      }
    ],
    "invoiceNumber": "INV-SF-10088",
    "invoiceDate": "2026-10-20T09:15:00Z",
    "trackingId": "BD84920194",
    "courierName": "Blue Dart Express",
    "courierTrackingUrl": "https://www.bluedart.com",
    "estimatedDeliveryDate": "2026-10-23"
  }
];
