// Flipkart Fee Calculation Engine
// All monetary values in INR (₹), rounded to 2 decimal places.

const COMMISSION_RATES = {
  'Mobile Phones': 0.03,
  'Laptops': 0.04,
  'Tablets': 0.055,
  'Televisions': 0.055,
  'Electronics Accessories': 0.10,
  'Sarees': 0.045,
  'Ethnic Wear': 0.135,
  'T-Shirts': 0.16,
  'Shoes': 0.12,
  'Watches': 0.14,
  "Women's Innerwear": 0.19,
  'Sunglasses': 0.19,
  'Home & Kitchen': 0.12,
  'Furniture': 0.10,
  'Tools & Hardware': 0.11,
  'Books': 0.08,
  'Grocery': 0.05,
  'Beauty & Personal Care': 0.10,
  'Toys': 0.15,
  'Sports & Fitness': 0.15,
  'Baby Products': 0.105,
};

// Fixed fee lookup: [Bronze, Silver, Gold NFBF, Gold FBF, Platinum]
const FIXED_FEE_TABLE = [
  { max: 250,    fees: [18, 15, 12, 8,  10] },
  { max: 500,    fees: [28, 23, 18, 12, 15] },
  { max: 1000,   fees: [50, 42, 35, 25, 28] },
  { max: 5000,   fees: [90, 78, 65, 50, 55] },
  { max: Infinity, fees: [150, 130, 110, 90, 95] },
];

const TIER_INDEX = { Bronze: 0, Silver: 1, Gold: 2, Platinum: 4 };
const GOLD_FBF_INDEX = 3;

// Shipping fee: [Local, Zonal, National]
const SHIPPING_BASE = [
  { max: 500,  fees: [0, 0, 50] },
  { max: 1000, fees: [20, 35, 65] },
];
const SHIPPING_ADDITIONAL_PER_500G = [12, 18, 25];
const ZONE_INDEX = { Local: 0, Zonal: 1, National: 2 };

function round2(val) {
  return Math.round(val * 100) / 100;
}

function getCommissionRate(category) {
  return COMMISSION_RATES[category] ?? 0.10; // default 10% if unknown
}

function getFixedFee(sellingPrice, sellerTier, fulfillmentMethod) {
  const isGoldFBF = sellerTier === 'Gold' && fulfillmentMethod === 'Platform Fulfillment';
  const colIndex = isGoldFBF ? GOLD_FBF_INDEX : (TIER_INDEX[sellerTier] ?? 0);

  for (const band of FIXED_FEE_TABLE) {
    if (sellingPrice <= band.max) {
      return band.fees[colIndex];
    }
  }
  return FIXED_FEE_TABLE[FIXED_FEE_TABLE.length - 1].fees[colIndex];
}

function getShippingFee(weightGrams, shippingZone) {
  const zIdx = ZONE_INDEX[shippingZone] ?? 2;

  if (weightGrams <= 500) {
    return SHIPPING_BASE[0].fees[zIdx];
  }
  if (weightGrams <= 1000) {
    return SHIPPING_BASE[1].fees[zIdx];
  }

  // Base fee for first 1kg + incremental for each additional 500g
  const baseFee = SHIPPING_BASE[1].fees[zIdx];
  const extraGrams = weightGrams - 1000;
  const extraSlabs = Math.ceil(extraGrams / 500);
  return baseFee + extraSlabs * SHIPPING_ADDITIONAL_PER_500G[zIdx];
}

/**
 * Calculate Flipkart seller fee breakdown and profitability.
 *
 * @param {Object} product
 * @param {number} product.sellingPrice - Listing / selling price in ₹
 * @param {number} product.cogs - Cost of goods sold
 * @param {number} [product.shippingCostToBuyer=0] - Seller's own shipping cost
 * @param {string} product.category - Product category
 * @param {number} product.weight - Product weight in grams
 * @param {number} [product.adsSpend=0] - Advertising spend per unit
 * @param {number} [product.returnRate=0] - Return rate as percentage (e.g., 5 for 5%)
 *
 * @param {Object} settings
 * @param {string} settings.fulfillmentMethod - 'Self-Ship' | 'Platform Fulfillment'
 * @param {string} settings.orderType - 'Prepaid' | 'COD'
 * @param {string} settings.sellerTier - 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
 * @param {string} settings.shippingZone - 'Local' | 'Zonal' | 'National'
 * @param {boolean} [settings.includeGSTAsFee=false]
 *
 * @returns {Object} BreakdownResult
 */
export function calculateFlipkart(product, settings) {
  const {
    sellingPrice,
    cogs = 0,
    shippingCostToBuyer = 0,
    category,
    weight = 500,
    adsSpend = 0,
    returnRate = 0,
  } = product;

  const {
    fulfillmentMethod = 'Self-Ship',
    orderType = 'Prepaid',
    sellerTier = 'Bronze',
    shippingZone = 'Local',
    includeGSTAsFee = false,
  } = settings;

  // --- Fee calculations ---

  // Commission / Referral fee
  const commissionRate = getCommissionRate(category);
  const referralFee = round2(sellingPrice * commissionRate);

  // Fixed / Closing fee
  const closingFee = getFixedFee(sellingPrice, sellerTier, fulfillmentMethod);

  // Shipping fee (platform-charged)
  const shippingFee = getShippingFee(weight, shippingZone);

  // Collection fee
  const collectionRate = orderType === 'COD' ? 0.025 : 0.02;
  const collectionFee = round2(sellingPrice * collectionRate);

  // COD surcharge
  const codFee = orderType === 'COD' ? 20 : 0;

  // TCS (1% of selling price, reclaimable but deducted from payout)
  const tcs = round2(sellingPrice * 0.01);

  // GST on all Flipkart fees (18%) - informational unless includeGSTAsFee
  const platformFees = referralFee + closingFee + shippingFee + collectionFee + codFee;
  const gstOnFees = round2(platformFees * 0.18);

  // Not applicable for Flipkart — set to 0
  const fulfillmentFee = 0;
  const weightHandlingFee = 0;
  const otherFees = 0;

  // --- Return cost model ---
  // returnRate is entered as a percentage (e.g. 5 for 5%) — convert to decimal.
  const returnRateDecimal = (returnRate || 0) / 100;
  // RTO (Return-to-Origin) share of returns is higher for COD than Prepaid
  const rtoShare = orderType === 'COD' ? 0.40 : 0.20;
  // Fraction of returned units that come back unsellable (COGS write-off)
  const cogsLossRate = 0.30;
  // Flipkart re-charges forward shipping on RTO, plus a reverse-pickup fee
  // (≈ forward shipping for customer returns)
  const reverseLogisticsPerReturn = shippingFee;
  const rtoPenaltyPerReturn = shippingFee;
  const perReturnLogistics = reverseLogisticsPerReturn + rtoShare * rtoPenaltyPerReturn;
  // Closing fee is NOT refunded on Flipkart returns (commission IS refunded)
  const feeClawbackPerReturn = closingFee;
  const cogsLossPerReturn = cogs * cogsLossRate;

  const returnLogisticsFee = round2(perReturnLogistics * returnRateDecimal);
  const returnImpact = round2(
    (perReturnLogistics + feeClawbackPerReturn + cogsLossPerReturn) * returnRateDecimal
  );

  // --- Totals ---
  let totalDeductions = round2(
    referralFee + closingFee + shippingFee + collectionFee + codFee + tcs
  );
  if (includeGSTAsFee) {
    totalDeductions = round2(totalDeductions + gstOnFees);
  }

  const netPayout = round2(sellingPrice - totalDeductions);

  // Profitability
  const totalCost = round2(cogs + shippingCostToBuyer + adsSpend);
  const grossProfit = round2(netPayout - cogs);
  const netProfit = round2(netPayout - totalCost - returnImpact);
  const profitMargin = sellingPrice > 0 ? round2((netProfit / sellingPrice) * 100) : 0;
  const roi = totalCost > 0 ? round2((netProfit / totalCost) * 100) : 0;

  // Break-even price: selling price at which net profit = 0
  // In this model returnImpact components are not proportional to SP, so treat it as fixed.
  const proportionalRate = commissionRate + collectionRate + 0.01;
  const gstMultiplier = includeGSTAsFee ? 1.18 : 1;
  const fixedCosts = closingFee + shippingFee + codFee + shippingCostToBuyer + adsSpend + cogs + returnImpact;
  const fixedGSTCosts = includeGSTAsFee
    ? round2((closingFee + shippingFee + codFee) * 0.18)
    : 0;
  const breakEvenPrice =
    (1 - proportionalRate * gstMultiplier) > 0
      ? round2((fixedCosts + fixedGSTCosts) / (1 - proportionalRate * gstMultiplier))
      : 0;

  // Contribution margin: (netPayout - COGS) / sellingPrice * 100
  const contributionMargin =
    sellingPrice > 0 ? round2(((netPayout - cogs) / sellingPrice) * 100) : 0;

  // Effective fee %: total platform deductions as % of selling price
  const effectiveFeePercent =
    sellingPrice > 0 ? round2((totalDeductions / sellingPrice) * 100) : 0;

  return {
    platform: 'Flipkart',
    currency: 'INR',
    sellingPrice: round2(sellingPrice),
    referralFee,
    closingFee: round2(closingFee),
    weightHandlingFee,
    fulfillmentFee,
    shippingFee: round2(shippingFee),
    collectionFee,
    codFee: round2(codFee),
    tcs,
    gstOnFees,
    adsSpend: round2(adsSpend),
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
