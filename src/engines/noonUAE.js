// ============================================================================
// Noon UAE Fee Calculation Engine
// ============================================================================

const r = (v) => Math.round(v * 100) / 100;

// ---------------------------------------------------------------------------
// Referral Fee Category Definitions
//
// Three fee structures:
//   1. FLAT:   { type: 'flat', rate }  — single rate on full selling price
//   2. TIERED: { type: 'tiered', tiers: [{ max, rate }] } — marginal/portion-
//              based: rate applies only to the PORTION of price within each band
//   3. THRESHOLD: { type: 'threshold', threshold, rateBelow, rateAbove } —
//              a single rate chosen based on whether price is ≤ or > threshold
// ---------------------------------------------------------------------------
const REFERRAL_FEE_MAP = {
  // -- Apparel & Fashion --
  'Apparel & Footwear':               { type: 'flat', rate: 0.27 },
  'Watches':                           { type: 'tiered', tiers: [{ max: 5000, rate: 0.15 }, { max: Infinity, rate: 0.05 }] },
  'Eyewear':                           { type: 'flat', rate: 0.15 },
  'Fine Jewelry':                      { type: 'tiered', tiers: [{ max: 1000, rate: 0.16 }, { max: Infinity, rate: 0.05 }] },
  'Other Jewelry':                     { type: 'flat', rate: 0.05 },
  'Gold Bars & Coins':                 { type: 'flat', rate: 0.05 },
  'Silver Bars':                       { type: 'flat', rate: 0.10 },
  'All Other Bags':                    { type: 'flat', rate: 0.25 },
  'Travel Luggage':                    { type: 'flat', rate: 0.20 },

  // -- Home --
  'Bath':                              { type: 'flat', rate: 0.15 },
  'Bedding':                           { type: 'flat', rate: 0.15 },
  'Home Decor':                        { type: 'flat', rate: 0.15 },
  'Kitchen & Dining':                  { type: 'flat', rate: 0.15 },
  'Gardening':                         { type: 'flat', rate: 0.15 },
  'Home Improvement':                  { type: 'flat', rate: 0.15 },
  'Furniture':                         { type: 'tiered', tiers: [{ max: 750, rate: 0.15 }, { max: Infinity, rate: 0.10 }] },
  'Cleaning & Hygiene':                { type: 'flat', rate: 0.09 },

  // -- Beauty --
  'Fragrance':                         { type: 'flat', rate: 0.14 },
  'Colour Cosmetics':                  { type: 'threshold', threshold: 50, rateBelow: 0.08, rateAbove: 0.15 },
  'Hair & Personal Care':              { type: 'threshold', threshold: 50, rateBelow: 0.08, rateAbove: 0.15 },
  'Electronic Personal Care':          { type: 'threshold', threshold: 50, rateBelow: 0.08, rateAbove: 0.15 },
  'Health Nutrition':                  { type: 'threshold', threshold: 50, rateBelow: 0.08, rateAbove: 0.14 },

  // -- Electronics: TV & Audio --
  'Televisions':                       { type: 'flat', rate: 0.05 },
  'Projectors':                        { type: 'flat', rate: 0.05 },
  'Streaming Devices':                 { type: 'flat', rate: 0.05 },
  'Audio Video Players':               { type: 'flat', rate: 0.10 },
  'Audio Video Accessories':           { type: 'flat', rate: 0.10 },
  'TV Accessories':                    { type: 'flat', rate: 0.15 },
  'Cases & Bags':                      { type: 'flat', rate: 0.15 },

  // -- Mobiles & Tablets --
  'Mobiles & Tablets':                 { type: 'threshold', threshold: 500, rateBelow: 0.06, rateAbove: 0.05 },
  'E-Book Readers':                    { type: 'threshold', threshold: 500, rateBelow: 0.06, rateAbove: 0.05 },
  'Sim Cards':                         { type: 'flat', rate: 0.04 },
  'Mobile Accessories - Top Brands':   { type: 'flat', rate: 0.15 },
  'Mobile Accessories - Other Brands': { type: 'flat', rate: 0.20 },
  'Stylus Digital Pens':               { type: 'flat', rate: 0.10 },

  // -- Computers --
  'Laptops & Desktops':                { type: 'flat', rate: 0.06 },
  'Memory Cards':                      { type: 'flat', rate: 0.07 },
  'Flash Drives':                      { type: 'tiered', tiers: [{ max: 250, rate: 0.15 }, { max: Infinity, rate: 0.08 }] },
  'SSD':                               { type: 'flat', rate: 0.06 },
  'HDD':                               { type: 'flat', rate: 0.06 },
  'Other Storage Devices':             { type: 'flat', rate: 0.06 },
  'Networking':                        { type: 'flat', rate: 0.06 },
  'Monitors':                          { type: 'flat', rate: 0.06 },
  'Graphics Cards':                    { type: 'flat', rate: 0.06 },
  'Other Computer Hardware':           { type: 'flat', rate: 0.13 },
  'Other Computer Accessories':        { type: 'flat', rate: 0.13 },
  'Softwares':                         { type: 'flat', rate: 0.15 },
  'Laptop Bags & Sleeves':             { type: 'flat', rate: 0.15 },
  'Printers':                          { type: 'flat', rate: 0.06 },
  'Scanners & Accessories':            { type: 'flat', rate: 0.06 },
  'Other Office Electronics':          { type: 'flat', rate: 0.13 },

  // -- Wearables & Audio --
  'Headphones':                        { type: 'tiered', tiers: [{ max: 250, rate: 0.15 }, { max: Infinity, rate: 0.08 }] },
  'Headphone Accessories':             { type: 'flat', rate: 0.08 },
  'Smartwatches':                      { type: 'flat', rate: 0.15 },
  'Fitness Bands':                     { type: 'flat', rate: 0.15 },
  'Smart Glasses':                     { type: 'flat', rate: 0.15 },
  'Wearable Accessories':              { type: 'flat', rate: 0.15 },
  'VR Headsets':                       { type: 'flat', rate: 0.12 },

  // -- Cameras --
  'Cameras':                           { type: 'flat', rate: 0.06 },
  'Lenses':                            { type: 'flat', rate: 0.06 },
  'Scopes':                            { type: 'flat', rate: 0.06 },
  'Camera Support Stabilizers':        { type: 'flat', rate: 0.08 },
  'Camera Accessories - General':      { type: 'tiered', tiers: [{ max: 250, rate: 0.15 }, { max: Infinity, rate: 0.08 }] },

  // -- Appliances --
  'Large Appliances':                  { type: 'threshold', threshold: 50, rateBelow: 0.15, rateAbove: 0.05 },
  'Small Appliances':                  { type: 'flat', rate: 0.13 },

  // -- Gaming --
  'Video Game Consoles':               { type: 'flat', rate: 0.06 },
  'Video Games':                       { type: 'flat', rate: 0.10 },
  'Video Game Accessories':            { type: 'flat', rate: 0.15 },
  'Video Game Gift Cards':             { type: 'flat', rate: 0.15 },

  // -- Media --
  'Books':                             { type: 'flat', rate: 0.15 },
  'Music':                             { type: 'flat', rate: 0.15 },
  'Video':                             { type: 'flat', rate: 0.10 },

  // -- Baby, Toys, Pets --
  'Baby Products':                     { type: 'threshold', threshold: 50, rateBelow: 0.08, rateAbove: 0.15 },
  'Toys':                              { type: 'flat', rate: 0.14 },
  'Pet Furniture':                     { type: 'threshold', threshold: 50, rateBelow: 0.08, rateAbove: 0.15 },
  'Pet Toys':                          { type: 'flat', rate: 0.14 },

  // -- Automotive --
  'Automotive - Audio & Video':        { type: 'flat', rate: 0.05 },
  'Automotive Vehicles':               { type: 'flat', rate: 0.05 },
  'Garage Equipment & Tyres':          { type: 'flat', rate: 0.06 },
  'Automotive Others':                 { type: 'flat', rate: 0.10 },

  // -- Food & Misc --
  'Food & Beverages':                  { type: 'flat', rate: 0.09 },
  'Sports & Outdoors':                 { type: 'threshold', threshold: 30, rateBelow: 0.20, rateAbove: 0.13 },
  'Stationery & Office Supplies':      { type: 'flat', rate: 0.12 },
};

// Minimum referral fee per item
const MIN_REFERRAL_FEE = 1; // AED

// ---------------------------------------------------------------------------
// Fee helpers
// ---------------------------------------------------------------------------

/**
 * Calculate referral fee based on category rules.
 * - flat: rate * sellingPrice
 * - tiered (marginal): each portion taxed at its band's rate
 * - threshold: one rate chosen by comparing price to a threshold
 */
function getReferralFee(category, sellingPrice) {
  const rule = REFERRAL_FEE_MAP[category];

  if (!rule) {
    // Default: "All Other Categories" at 14%
    return Math.max(r(sellingPrice * 0.14), MIN_REFERRAL_FEE);
  }

  let fee = 0;

  if (rule.type === 'flat') {
    fee = r(sellingPrice * rule.rate);
  } else if (rule.type === 'tiered') {
    let remaining = sellingPrice;
    let prev = 0;
    for (const tier of rule.tiers) {
      const bandWidth = tier.max === Infinity ? remaining : tier.max - prev;
      const taxable = Math.min(remaining, bandWidth);
      if (taxable <= 0) break;
      fee += taxable * tier.rate;
      remaining -= taxable;
      prev = tier.max;
    }
    fee = r(fee);
  } else if (rule.type === 'threshold') {
    const rate = sellingPrice <= rule.threshold ? rule.rateBelow : rule.rateAbove;
    fee = r(sellingPrice * rate);
  }

  return Math.max(fee, MIN_REFERRAL_FEE);
}

/**
 * FBN (Fulfilled by Noon) outbound fee — Standard Parcel.
 * Based on weight (kg) and Average Selling Price bracket.
 */
function getFbnOutboundFee(weightGrams, sellingPrice) {
  const weightKg = weightGrams / 1000;
  const lowASP = sellingPrice <= 25; // AED

  // Base slabs: [maxKg, feeLow, feeHigh]
  const slabs = [
    [0.25,  7.0,  8.5],
    [0.50,  7.0,  9.0],
    [1.0,   8.0, 10.0],
    [1.5,   8.5, 10.5],
    [2.0,   9.0, 11.0],
    [3.0,  10.0, 12.0],
  ];

  for (const [maxKg, feeLow, feeHigh] of slabs) {
    if (weightKg <= maxKg) {
      return lowASP ? feeLow : feeHigh;
    }
  }

  // Above 3 kg: base at 3 kg + 1.0 per additional kg up to 12 kg
  const baseFee = lowASP ? 10.0 : 12.0;
  const additionalKg = Math.min(weightKg, 12) - 3;
  const extraSlabs = Math.ceil(additionalKg);
  return r(baseFee + extraSlabs * 1.0);
}

// ---------------------------------------------------------------------------
// Main calculation
// ---------------------------------------------------------------------------

export function calculateNoonUAE(product, settings) {
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
  } = settings;

  // --- Core Noon fees ---
  const referralFee = getReferralFee(category, sellingPrice);

  // No closing fee on Noon UAE
  const closingFee = 0;

  // No weight handling fee (separate from fulfillment)
  const weightHandlingFee = 0;

  // FBN outbound fee (only for Platform Fulfillment)
  const fulfillmentFee = fulfillmentMethod === 'Platform Fulfillment'
    ? getFbnOutboundFee(weight, sellingPrice)
    : 0;

  // No separate shipping fee, collection fee, COD fee, or TCS on Noon UAE
  const shippingFee = 0;
  const collectionFee = 0;
  const codFee = 0;
  const tcs = 0;

  // VAT 5% on fees is informational only (not deducted from payout)
  const gstOnFees = r((referralFee + fulfillmentFee) * 0.05);

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
    adsSpend +
    otherFees
  );

  // --- Payout & profit ---
  const netPayout = r(sellingPrice - totalDeductions);

  // Return impact: estimated cost of returns
  const returnRateDecimal = returnRate / 100;
  const returnImpact = r(
    (cogs + shippingCostToBuyer + referralFee + fulfillmentFee) * returnRateDecimal
  );

  const grossProfit = r(netPayout - cogs - shippingCostToBuyer);
  const netProfit = r(grossProfit - returnImpact);

  // --- Derived metrics ---
  const profitMargin = sellingPrice > 0 ? r((netProfit / sellingPrice) * 100) : 0;
  const roi = cogs > 0 ? r((netProfit / cogs) * 100) : 0;

  const effectiveFeePercent = sellingPrice > 0
    ? r((totalDeductions / sellingPrice) * 100)
    : 0;
  const feeRateDecimal = effectiveFeePercent / 100;
  const totalCostBase = cogs + shippingCostToBuyer + returnImpact;
  const breakEvenPrice = feeRateDecimal < 1
    ? r(totalCostBase / (1 - feeRateDecimal))
    : 0;

  const contributionMargin = sellingPrice > 0
    ? r(((sellingPrice - totalDeductions - cogs - shippingCostToBuyer) / sellingPrice) * 100)
    : 0;

  return {
    platform: 'Noon UAE',
    currency: 'AED',
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
export const NOON_UAE_CATEGORIES = [
  ...Object.keys(REFERRAL_FEE_MAP),
  'All Other Categories',
];
