// ============================================================================
// Amazon India Fee Calculation Engine
// ============================================================================

const r = (v) => Math.round(v * 100) / 100;

// ---------------------------------------------------------------------------
// Referral Fee Category Definitions
// Each entry: { tiers: [ { max, rate } ... ] }
//   - max: upper bound of selling price for this tier (Infinity for last)
//   - rate: percentage expressed as decimal (e.g. 0.23 = 23%)
// The FIRST tier whose max >= sellingPrice is used. The rate applies to the
// FULL selling price (non-marginal).
// ---------------------------------------------------------------------------
const REFERRAL_FEE_MAP = {
  // -- Automotive --
  'Helmets & Riding Gloves': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.085 }
  ],
  'Tyres & Rims': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.03 }
  ],
  '2-Wheelers, 4-Wheelers, EVs': [
    { max: 1000, rate: 0 }, { max: 50000, rate: 0.05 }, { max: Infinity, rate: 0.02 }
  ],
  'Car & Bike Parts, Engine, Suspension': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.16 }
  ],
  'Car Floor Mats, Seat Covers, Riding Gear': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.14 }
  ],
  'Car Electronics Devices': [
    { max: 300, rate: 0 }, { max: 500, rate: 0.075 }, { max: 1000, rate: 0.095 }, { max: Infinity, rate: 0.12 }
  ],
  'Car Electronics Accessories': [
    { max: 300, rate: 0 }, { max: 1000, rate: 0.05 }, { max: Infinity, rate: 0.15 }
  ],
  'Car Cradles, Lens Kits, Tablet Cases': [
    { max: 300, rate: 0 }, { max: 1000, rate: 0.05 }, { max: Infinity, rate: 0.285 }
  ],
  'Oils & Lubricants': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.115 }
  ],
  'Automotive Batteries & Air Fresheners': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.085 }
  ],
  'Vehicle Tools & Appliances': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.085 }
  ],
  'Automotive Cleaning Kits, Car Care, Lighting, Paints': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.13 }
  ],

  // -- Apparel --
  'Apparel - Shorts': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.24 }
  ],
  "Apparel - Men's T-Shirts": [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.23 }
  ],
  'Apparel - Shirts': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.21 }
  ],
  'Apparel - Accessories': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.19 }
  ],
  'Apparel - Dress': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.19 }
  ],
  'Apparel - Sleepwear': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.19 }
  ],
  'Apparel - Thermals': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.19 }
  ],
  'Apparel - Socks & Stockings': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.19 }
  ],
  'Pants - Trousers, Jeans, Trackpants, Leggings': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.19 }
  ],
  "Apparel - Women's Innerwear & Lingerie": [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.18 }
  ],
  'Apparel - Sweatshirts & Jackets': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.18 }
  ],
  'Apparel - Other Innerwear': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.185 }
  ],
  'Apparel - Ethnic Wear': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.165 }
  ],
  'Apparel - Sarees & Dress Materials': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.15 }
  ],
  'Apparel - Baby': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.07 }
  ],

  // -- Footwear --
  'Shoes': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.08 }
  ],
  'Kids Shoes': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.16 }
  ],
  'Flip Flops, Fashion Sandals, Slippers': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.15 }
  ],

  // -- Bags & Luggage --
  'Backpacks': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.145 }
  ],
  'Handbags': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.12 }
  ],
  'Luggage - Suitcase & Trolleys': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.055 }
  ],
  'Luggage - Travel Accessories': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.12 }
  ],
  'Wallets': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.14 }
  ],

  // -- Watches & Jewellery --
  'Watches': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.15 }
  ],
  'Fashion Jewellery': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.225 }
  ],
  'Fine Jewellery - Studded': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.13 }
  ],
  'Fine Jewellery - Unstudded & Solitaire': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.05 }
  ],
  'Fine Jewellery - Gold Coins': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.06 }
  ],
  'Silver Jewellery': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.13 }
  ],
  'Silver Coins & Bars': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.06 }
  ],
  'Eyewear - Sunglasses, Frames': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.185 }
  ],

  // -- Electronics --
  'Mobile Phones': [
    { max: Infinity, rate: 0.05 }
  ],
  'Laptops': [
    { max: Infinity, rate: 0.06 }
  ],
  'Desktops': [
    { max: Infinity, rate: 0.08 }
  ],
  'Television': [
    { max: Infinity, rate: 0.06 }
  ],
  'Tablets': [
    { max: 300, rate: 0 }, { max: 12000, rate: 0.06 }, { max: Infinity, rate: 0.10 }
  ],
  'Monitors': [
    { max: 1000, rate: 0.065 }, { max: Infinity, rate: 0.08 }
  ],
  'Camera & Camcorder': [
    { max: 1000, rate: 0.05 }, { max: 19000, rate: 0.07 }, { max: 49000, rate: 0.09 }, { max: Infinity, rate: 0.07 }
  ],
  'Camera Lenses': [
    { max: 1000, rate: 0.07 }, { max: Infinity, rate: 0.10 }
  ],
  'Camera Accessories': [
    { max: 300, rate: 0 }, { max: 1000, rate: 0.05 }, { max: Infinity, rate: 0.135 }
  ],
  'Electronic Devices': [
    { max: 1000, rate: 0.09 }, { max: Infinity, rate: 0.11 }
  ],
  'Headsets, Headphones, Earphones': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.18 }
  ],
  'Speakers': [
    { max: 500, rate: 0.11 }, { max: 1000, rate: 0.115 }, { max: Infinity, rate: 0.14 }
  ],
  'Power Banks & Chargers': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.205 }
  ],
  'Cables & Adapters - Electronics': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.20 }
  ],
  'Cases, Covers, Screen Guards': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.25 }
  ],
  'Memory Cards': [
    { max: 500, rate: 0.16 }, { max: 1000, rate: 0.05 }, { max: Infinity, rate: 0.16 }
  ],
  'Hard Disks': [
    { max: 1000, rate: 0.095 }, { max: Infinity, rate: 0.125 }
  ],
  'Smart Watches & Accessories': [
    { max: 300, rate: 0 }, { max: 1000, rate: 0.05 }, { max: Infinity, rate: 0.17 }
  ],
  'PC Components - RAM & Motherboards': [
    { max: 300, rate: 0 }, { max: Infinity, rate: 0.055 }
  ],
  'Accessories - Electronics, PC, Wireless': [
    { max: 300, rate: 0 }, { max: 1000, rate: 0.05 }, { max: Infinity, rate: 0.17 }
  ],
  'Keyboards & Mouse': [
    { max: 300, rate: 0 }, { max: 1000, rate: 0.05 }, { max: Infinity, rate: 0.17 }
  ],
  'Scanners & Printers': [
    { max: 1000, rate: 0.09 }, { max: Infinity, rate: 0.105 }
  ],
  'Modems & Networking Devices': [
    { max: Infinity, rate: 0.14 }
  ],
  'USB Flash Drives / Pen Drives': [
    { max: Infinity, rate: 0.16 }
  ],
  'Projectors, Home Theatre, Binoculars, Telescopes': [
    { max: Infinity, rate: 0.06 }
  ],
  'Kindle Accessories': [
    { max: Infinity, rate: 0.25 }
  ],
  'Laptop & Camera Battery': [
    { max: 300, rate: 0.14 }, { max: 500, rate: 0.125 }, { max: 1000, rate: 0.14 }, { max: Infinity, rate: 0.155 }
  ],
  'GPS Devices': [
    { max: 300, rate: 0.135 }, { max: 500, rate: 0.125 }, { max: Infinity, rate: 0.135 }
  ],
  'Landline Phones': [
    { max: Infinity, rate: 0.07 }
  ],
  'Laptop Bags & Sleeves': [
    { max: 300, rate: 0 }, { max: 1000, rate: 0.05 }, { max: Infinity, rate: 0.145 }
  ],
  'Software Products': [
    { max: 1000, rate: 0 }, { max: 2000, rate: 0.075 }, { max: Infinity, rate: 0.095 }
  ],

  // -- Entertainment & Music --
  'Entertainment Collectibles': [
    { max: 300, rate: 0.13 }, { max: Infinity, rate: 0.17 }
  ],
  'Musical Instruments - Other Products': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.11 }
  ],
  'Musical Instruments - DJ, VJ, Recording, PA, Cables': [
    { max: 300, rate: 0.06 }, { max: 500, rate: 0.045 }, { max: 1000, rate: 0 }, { max: Infinity, rate: 0.11 }
  ],
  'Musical Instruments - Microphones': [
    { max: 300, rate: 0.095 }, { max: 1000, rate: 0 }, { max: Infinity, rate: 0.115 }
  ],
  'Musical Instruments - Keyboards': [
    { max: 500, rate: 0.08 }, { max: 1000, rate: 0 }, { max: Infinity, rate: 0.08 }
  ],
  'Musical Instruments - Guitars': [
    { max: 500, rate: 0.10 }, { max: 1000, rate: 0 }, { max: Infinity, rate: 0.10 }
  ],

  // -- Gaming --
  'Video Game Consoles': [
    { max: 500, rate: 0.07 }, { max: 1000, rate: 0.05 }, { max: Infinity, rate: 0.09 }
  ],
  'Video Game Accessories': [
    { max: 300, rate: 0 }, { max: 1000, rate: 0.05 }, { max: Infinity, rate: 0.135 }
  ],
  'Video Game Online Services': [
    { max: 1000, rate: 0 }, { max: 2000, rate: 0.02 }, { max: Infinity, rate: 0.03 }
  ],
  'Movies & Music': [
    { max: 500, rate: 0.065 }, { max: 1000, rate: 0 }, { max: Infinity, rate: 0.065 }
  ],

  // -- Toys & Baby --
  'Toys - Drones': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.30 }
  ],
  'Toys - Party Supplies, Games & Puzzles, RC Vehicles': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.125 }
  ],
  'Toys - Infant & Pre-school, STEM, Art & Craft': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.115 }
  ],
  'Toys - Outdoor, Activity, Sports, Plush, Dolls': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.105 }
  ],
  'Baby Strollers': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.09 }
  ],
  'Baby Diapers': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.095 }
  ],
  'Baby Hardlines (Carriers, Walkers, Car Seats)': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.065 }
  ],
  'Baby & Kids Furniture & Home Decor': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.085 }
  ],
  'Baby Walker': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.05 }
  ],

  // -- Books --
  'Books': [
    { max: 250, rate: 0 }, { max: 500, rate: 0.02 }, { max: 1000, rate: 0.04 }, { max: Infinity, rate: 0.135 }
  ],
  'School Textbook Bundles': [
    { max: 250, rate: 0.02 }, { max: 1000, rate: 0.03 }, { max: 1500, rate: 0.04 }, { max: Infinity, rate: 0.045 }
  ],

  // -- Grocery --
  'Grocery - Herbs & Spices': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.08 }
  ],
  'Grocery - Dried Fruits & Nuts': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.09 }
  ],
  'Grocery - Hampers & Gifting': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.115 }
  ],
  'Grocery - Oils': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.05 }
  ],
  'Grocery - Beverages': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.10 }
  ],

  // -- Beauty & Personal Care --
  'Beauty - Fragrance': [
    { max: 500, rate: 0 }, { max: 1000, rate: 0.14 }, { max: Infinity, rate: 0.10 }
  ],
  'Beauty - Haircare, Bath & Shower': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.08 }
  ],
  'Beauty - Makeup': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.07 }
  ],
  'Luxury Beauty': [
    { max: 500, rate: 0 }, { max: 1000, rate: 0.09 }, { max: Infinity, rate: 0.10 }
  ],
  'Face Wash': [
    { max: 500, rate: 0 }, { max: 1000, rate: 0.09 }, { max: Infinity, rate: 0.10 }
  ],
  'Moisturizer Cream': [
    { max: 500, rate: 0 }, { max: 1000, rate: 0.09 }, { max: Infinity, rate: 0.095 }
  ],
  'Sunscreen': [
    { max: 500, rate: 0 }, { max: 1000, rate: 0.09 }, { max: Infinity, rate: 0.095 }
  ],
  'Deodorants': [
    { max: 500, rate: 0 }, { max: 1000, rate: 0.065 }, { max: Infinity, rate: 0.07 }
  ],
  'Facial Steamers': [
    { max: 500, rate: 0 }, { max: Infinity, rate: 0.07 }
  ],
  'Personal Care - Grooming & Styling': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.095 }
  ],
  'Personal Care - Electric Massagers': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.145 }
  ],
  'Personal Care - Glucometer & Strips': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.055 }
  ],
  'Personal Care - Thermometers': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.105 }
  ],
  'Personal Care - Weighing Scales & Fat Analyzers': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.135 }
  ],

  // -- Pets --
  'Pet Foods': [
    { max: 300, rate: 0 }, { max: 1000, rate: 0.065 }, { max: Infinity, rate: 0.095 }
  ],
  'Pet Accessories (Apparel, Collar, Leash)': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.125 }
  ],
  'Pet Comforters (Bed, Feeder, Cages, Kennels)': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.125 }
  ],
  'Pet Essentials (Healthcare, Grooming, Dental)': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.14 }
  ],
  'Pet - Aquatics Supplies': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.14 }
  ],

  // -- Office & Stationery --
  'Office Products - Supplies': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.13 }
  ],
  'Office Products - Writing Instruments': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.14 }
  ],
  'Office Products - Arts & Crafts': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.05 }
  ],
  'Office Products - Electronic Devices': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.115 }
  ],

  // -- Industrial & Tools --
  'Power & Hand Tools, Water Dispensers': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.10 }
  ],
  'Industrial - Scientific Supplies': [
    { max: 1000, rate: 0 }, { max: 15000, rate: 0.115 }, { max: Infinity, rate: 0.07 }
  ],
  'Industrial - Commercial & Food Handling Equipment': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.055 }
  ],
  'Industrial - Electrical Testing, Barcode Scanners': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.06 }
  ],
  'Packing Materials': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.05 }
  ],
  '3D Printers': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.12 }
  ],

  // -- Health --
  'Masks': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.08 }
  ],
  'Stethoscopes': [
    { max: 1000, rate: 0 }, { max: Infinity, rate: 0.105 }
  ],
};

// ---------------------------------------------------------------------------
// Fee helpers
// ---------------------------------------------------------------------------

function getReferralFee(category, sellingPrice) {
  const tiers = REFERRAL_FEE_MAP[category];
  if (!tiers) {
    // Default fallback: 15% above 1000, 0% at or below 1000
    if (sellingPrice <= 1000) return 0;
    return r(sellingPrice * 0.15);
  }
  for (const tier of tiers) {
    if (sellingPrice <= tier.max) {
      return r(sellingPrice * tier.rate);
    }
  }
  // Should not reach here; last tier has max = Infinity
  const last = tiers[tiers.length - 1];
  return r(sellingPrice * last.rate);
}

function getClosingFee(sellingPrice) {
  if (sellingPrice <= 250) return 5;
  if (sellingPrice <= 500) return 8;
  if (sellingPrice <= 1000) return 12;
  if (sellingPrice <= 5000) return 25;
  return 50;
}

function getWeightHandlingFee(weightGrams, zone) {
  const zoneIndex = { Local: 0, Zonal: 1, National: 2 };
  const zi = zoneIndex[zone] ?? 2; // default National

  const base = [
    [35, 42, 55],  // <= 500g
    [47, 55, 72],  // 501g - 1kg
  ];
  const extra = [8, 11, 15]; // per additional 500g after 1kg

  if (weightGrams <= 500) return base[0][zi];
  if (weightGrams <= 1000) return base[1][zi];

  // Above 1kg
  const additionalGrams = weightGrams - 1000;
  const additionalSlabs = Math.ceil(additionalGrams / 500);
  return base[1][zi] + additionalSlabs * extra[zi];
}

function getFbaFulfillmentFee(weightGrams) {
  if (weightGrams <= 250) return 44;
  if (weightGrams <= 500) return 55;
  if (weightGrams <= 1000) return 90;
  if (weightGrams <= 2000) return 120;

  // Above 2kg
  const additionalGrams = weightGrams - 2000;
  const additionalSlabs = Math.ceil(additionalGrams / 500);
  return 120 + additionalSlabs * 30;
}

// ---------------------------------------------------------------------------
// Main calculation
// ---------------------------------------------------------------------------

export function calculateAmazonIndia(product, settings) {
  const {
    sellingPrice = 0,
    cogs = 0,
    shippingCostToBuyer = 0,
    category = '',
    weight = 500,
    adsSpend = 0,
    returnRate = 0,
  } = product;

  const {
    fulfillmentMethod = 'Self-Ship',
    orderType = 'Prepaid',
    shippingZone = 'National',
    includeGSTAsFee = false,
  } = settings;

  // --- Core Amazon fees ---
  const referralFee = getReferralFee(category, sellingPrice);
  const closingFee = getClosingFee(sellingPrice);

  // Weight handling or FBA fulfillment
  let weightHandlingFee = 0;
  let fulfillmentFee = 0;
  if (fulfillmentMethod === 'Platform Fulfillment') {
    fulfillmentFee = getFbaFulfillmentFee(weight);
  } else {
    weightHandlingFee = getWeightHandlingFee(weight, shippingZone);
  }

  // Shipping fee is 0 for Amazon India (included in weight handling)
  const shippingFee = 0;

  // Collection fee is 0 for Amazon India
  const collectionFee = 0;

  // COD fee
  const codFee = orderType === 'COD' ? 20 : 0;

  // TCS (Tax Collected at Source) - 1% of selling price
  const tcs = r(sellingPrice * 0.01);

  // Sum of Amazon platform fees (before GST)
  const platformFees = r(referralFee + closingFee + weightHandlingFee + fulfillmentFee + codFee);

  // GST on fees (18% of all Amazon fees)
  const gstOnFees = r(platformFees * 0.18);

  // Other fees placeholder
  const otherFees = 0;

  // --- Total deductions ---
  const totalDeductions = r(
    referralFee +
    closingFee +
    weightHandlingFee +
    fulfillmentFee +
    shippingFee +
    collectionFee +
    codFee +
    tcs +
    (includeGSTAsFee ? gstOnFees : 0) +
    adsSpend +
    otherFees
  );

  // --- Payout & profit ---
  const netPayout = r(sellingPrice - totalDeductions);

  // --- Return cost model ---
  // returnRate is entered as a percentage (e.g. 5 for 5%)
  const returnRateDecimal = returnRate / 100;
  const isCOD = orderType === 'COD';
  const rtoShare = isCOD ? 0.30 : 0.10;
  const cogsLossRate = 0.25;
  // FBA: Amazon charges Returns Processing ≈ 50% of fulfillmentFee
  // Self-Ship: seller incurs reverse pickup ≈ 50% of weightHandlingFee
  const reverseLogisticsPerReturn = fulfillmentMethod === 'Platform Fulfillment'
    ? fulfillmentFee * 0.5
    : weightHandlingFee * 0.5;
  // RTO: full forward handling re-charged
  const rtoPenaltyPerReturn = fulfillmentMethod === 'Platform Fulfillment'
    ? fulfillmentFee
    : weightHandlingFee;
  const perReturnLogistics = reverseLogisticsPerReturn + rtoShare * rtoPenaltyPerReturn;
  // Amazon keeps ~20% of referralFee as Returns Administration Fee
  const feeClawbackPerReturn = referralFee * 0.20 + closingFee;
  const cogsLossPerReturn = cogs * cogsLossRate + shippingCostToBuyer;

  const returnLogisticsFee = r(perReturnLogistics * returnRateDecimal);
  const returnImpact = r(
    (perReturnLogistics + feeClawbackPerReturn + cogsLossPerReturn) * returnRateDecimal
  );

  const grossProfit = r(netPayout - cogs - shippingCostToBuyer);
  const netProfit = r(grossProfit - returnImpact);

  // --- Derived metrics ---
  const profitMargin = sellingPrice > 0 ? r((netProfit / sellingPrice) * 100) : 0;
  const roi = cogs > 0 ? r((netProfit / cogs) * 100) : 0;

  // Break-even price: the selling price at which netProfit = 0
  // Approximate: totalCost / (1 - effectiveFeeRate)
  const effectiveFeePercent = sellingPrice > 0
    ? r((totalDeductions / sellingPrice) * 100)
    : 0;
  const feeRateDecimal = effectiveFeePercent / 100;
  const totalCostBase = cogs + shippingCostToBuyer + returnImpact;
  const breakEvenPrice = feeRateDecimal < 1
    ? r(totalCostBase / (1 - feeRateDecimal))
    : 0;

  // Contribution margin: selling price minus all variable costs
  const contributionMargin = sellingPrice > 0
    ? r(((sellingPrice - totalDeductions - cogs - shippingCostToBuyer) / sellingPrice) * 100)
    : 0;

  return {
    platform: 'Amazon India',
    currency: 'INR',
    sellingPrice: r(sellingPrice),
    referralFee,
    closingFee,
    weightHandlingFee,
    fulfillmentFee,
    shippingFee,
    collectionFee,
    codFee,
    tcs,
    gstOnFees,
    adsSpend: r(adsSpend),
    returnLogisticsFee,
    returnImpact,
    otherFees,
    totalDeductions,
    netPayout,
    grossProfit,
    netProfit,
    profitMargin,
    roi,
    breakEvenPrice,
    contributionMargin,
    effectiveFeePercent,
  };
}

// Export category list for UI dropdowns
export const AMAZON_INDIA_CATEGORIES = Object.keys(REFERRAL_FEE_MAP);
