// ============================================================================
// eBay Fee Calculation Engine
// ============================================================================

const r = (v) => Math.round(v * 100) / 100;

// ---------------------------------------------------------------------------
// Final Value Fee (FVF) Category Definitions
//
// Each entry: { baseRate, overflowRate, overflowThreshold, noPerOrderFee }
// FVF is TIERED (marginal): baseRate applies to the portion up to
// overflowThreshold, then overflowRate applies to the excess.
//
// Special multi-tier categories use { tiers: [{ max, rate }] } format.
// ---------------------------------------------------------------------------
const FVF_MAP = {
  // -- Standard categories --
  'Most Categories':                  { baseRate: 0.136, overflowRate: 0.0235, overflowThreshold: 7500 },
  'Books & Magazines':                { baseRate: 0.153, overflowRate: 0.0235, overflowThreshold: 7500 },
  'Movies & TV':                      { baseRate: 0.153, overflowRate: 0.0235, overflowThreshold: 7500 },
  'Music':                            { baseRate: 0.153, overflowRate: 0.0235, overflowThreshold: 7500 },

  // -- Coins --
  'Coins & Paper Money':              { baseRate: 0.1325, overflowRate: 0.0235, overflowThreshold: 7500 },
  'Coins & Paper Money > Bullion':    { baseRate: 0.136, overflowRate: 0.07,   overflowThreshold: 7500 },

  // -- Fashion --
  "Women's Handbags":                 { baseRate: 0.15,  overflowRate: 0.09,   overflowThreshold: 2000 },
  'Jewelry & Watches':                { baseRate: 0.15,  overflowRate: 0.09,   overflowThreshold: 5000 },

  // -- Watches Parts: 3-tier --
  'Watches Parts & Accessories':      {
    tiers: [
      { max: 1000, rate: 0.15 },
      { max: 7500, rate: 0.065 },
      { max: Infinity, rate: 0.03 },
    ],
  },

  // -- Collectibles --
  'Collectibles - Comic Books & Memorabilia': { baseRate: 0.1325, overflowRate: 0.0235, overflowThreshold: 7500 },
  'Collectibles - Non-Sport Trading Cards':   { baseRate: 0.1325, overflowRate: 0.0235, overflowThreshold: 7500 },
  'Sports Trading Cards':                     { baseRate: 0.1325, overflowRate: 0.0235, overflowThreshold: 7500 },
  'Collectible Card Games':                   { baseRate: 0.1325, overflowRate: 0.0235, overflowThreshold: 7500 },

  // -- NFT --
  'NFT Categories':                   { baseRate: 0.05, overflowRate: 0.05, overflowThreshold: Infinity },

  // -- Heavy Equipment --
  'Heavy Equipment':                  { baseRate: 0.03, overflowRate: 0.005, overflowThreshold: 15000 },
  'Commercial Printing':              { baseRate: 0.03, overflowRate: 0.005, overflowThreshold: 15000 },
  'Food Trucks':                      { baseRate: 0.03, overflowRate: 0.005, overflowThreshold: 15000 },

  // -- Musical Instruments --
  'Guitars & Basses':                 { baseRate: 0.067, overflowRate: 0.0235, overflowThreshold: 7500 },

  // -- Athletic Shoes --
  'Athletic Shoes':                   { baseRate: 0.08, overflowRate: 0.08, overflowThreshold: Infinity, noPerOrderFee: true },
};

// Store tier discount on base FVF percentage (absolute reduction)
const STORE_DISCOUNT = {
  'No Store':    0,
  'Starter':     0,
  'Basic':       0.005,
  'Premium':     0.01,
  'Anchor':      0.015,
  'Enterprise':  0.02,
};

const MIN_FVF_RATE = 0.02; // Floor: 2%

// ---------------------------------------------------------------------------
// Fee helpers
// ---------------------------------------------------------------------------

/**
 * Calculate FVF using marginal/tiered approach with store discount.
 */
function getFinalValueFee(category, sellingPrice, storeTier) {
  const rule = FVF_MAP[category] || FVF_MAP['Most Categories'];
  const discount = STORE_DISCOUNT[storeTier] || 0;

  if (rule.tiers) {
    // Multi-tier marginal calculation
    let fee = 0;
    let remaining = sellingPrice;
    let prev = 0;
    for (const tier of rule.tiers) {
      const bandWidth = tier.max === Infinity ? remaining : tier.max - prev;
      const taxable = Math.min(remaining, bandWidth);
      if (taxable <= 0) break;
      const effectiveRate = Math.max(tier.rate - discount, MIN_FVF_RATE);
      fee += taxable * effectiveRate;
      remaining -= taxable;
      prev = tier.max;
    }
    return r(fee);
  }

  // Standard 2-tier: baseRate up to threshold, overflowRate above
  const baseRate = Math.max(rule.baseRate - discount, MIN_FVF_RATE);
  const overflowRate = Math.max(rule.overflowRate - discount, MIN_FVF_RATE);

  if (sellingPrice <= rule.overflowThreshold) {
    return r(sellingPrice * baseRate);
  }

  const basePortion = rule.overflowThreshold * baseRate;
  const overflowPortion = (sellingPrice - rule.overflowThreshold) * overflowRate;
  return r(basePortion + overflowPortion);
}

/**
 * Per-order fee: $0.30 if price ≤ $10, $0.40 if > $10.
 * Exception: Athletic Shoes (≥$150) has no per-order fee.
 */
function getPerOrderFee(category, sellingPrice) {
  const rule = FVF_MAP[category] || FVF_MAP['Most Categories'];
  if (rule.noPerOrderFee && sellingPrice >= 150) return 0;
  return sellingPrice <= 10 ? 0.30 : 0.40;
}

// ---------------------------------------------------------------------------
// Main calculation
// ---------------------------------------------------------------------------

export function calculateEbay(product, settings) {
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
    ebayStoreTier = 'No Store',
  } = settings;

  // --- Core eBay fees ---
  // referralFee = Final Value Fee (FVF)
  const referralFee = getFinalValueFee(category, sellingPrice, ebayStoreTier);

  // closingFee = per-order fee
  const closingFee = getPerOrderFee(category, sellingPrice);

  // No weight handling, fulfillment, shipping, collection, COD, TCS, or GST on eBay
  const weightHandlingFee = 0;
  const fulfillmentFee = 0;
  const shippingFee = 0;
  const collectionFee = 0;
  const codFee = 0;
  const tcs = 0;
  const gstOnFees = 0;

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
    (cogs + shippingCostToBuyer + referralFee + closingFee) * returnRateDecimal
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
    platform: 'eBay',
    currency: 'USD',
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
export const EBAY_CATEGORIES = Object.keys(FVF_MAP);
