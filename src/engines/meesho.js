// Meesho Fee Calculation Engine
// All monetary values in INR (₹), rounded to 2 decimal places.

function round2(val) {
  return Math.round(val * 100) / 100;
}

// Fixed fee lookup: None, Meesho is 0% commission and 0 fixed fee.
function getFixedFee() {
  return 0;
}

// Shipping fee: Flat tiered shipping structure based on weight and zone
const ZONE_INDEX = { Local: 0, Zonal: 1, National: 2 };
const SHIPPING_0_500 = [45, 55, 75]; // Local, Regional, National
const SHIPPING_500_1000 = [60, 75, 100];
const SHIPPING_INCREMENTAL_500 = [20, 25, 30];

function getShippingFee(weightGrams, shippingZone) {
  const zIdx = ZONE_INDEX[shippingZone] ?? 2;
  
  if (weightGrams <= 500) return SHIPPING_0_500[zIdx];
  if (weightGrams <= 1000) return SHIPPING_500_1000[zIdx];
  
  const extraGrams = weightGrams - 1000;
  const extraSlabs = Math.ceil(extraGrams / 500);
  return SHIPPING_500_1000[zIdx] + (extraSlabs * SHIPPING_INCREMENTAL_500[zIdx]);
}

/**
 * Calculate Meesho seller fee breakdown and profitability.
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
 * @param {string} settings.orderType - 'Prepaid' | 'COD'
 * @param {boolean} [settings.includeGSTAsFee=false]
 *
 * @returns {Object} BreakdownResult
 */
export function calculateMeesho(product, settings) {
  const {
    sellingPrice,
    cogs = 0,
    shippingCostToBuyer = 0,
    weight = 500,
    adsSpend = 0,
    returnRate = 0,
  } = product;

  const {
    orderType = 'Prepaid',
    shippingZone = 'National',
    includeGSTAsFee = false,
  } = settings;

  // --- Fee calculations ---

  // Commission / Referral fee is 0% across all categories on Meesho
  const referralFee = 0;

  // Fixed / Closing fee is 0
  const closingFee = getFixedFee();

  // Shipping fee (platform-charged)
  const shippingFee = getShippingFee(weight, shippingZone);

  // Collection fee / COD Fee
  // Meesho usually absorbs PG fee but applies a COD charge and a small return penalty
  const codFee = orderType === 'COD' ? 15 : 0;
  const collectionFee = 0; // PG fee covered by 0% initiative typically or rolled into ad spend.

  // TCS (1% of selling price, reclaimable but deducted from payout)
  const tcs = round2(sellingPrice * 0.01);

  // GST on all Meesho fees (18%) - informational unless includeGSTAsFee
  const platformFees = referralFee + closingFee + shippingFee + collectionFee + codFee;
  const gstOnFees = round2(platformFees * 0.18);

  // Not applicable
  const fulfillmentFee = 0;
  const weightHandlingFee = 0;
  
  // --- Return cost model ---
  // Meesho penalizes forward + reverse shipping. RTO incidence is high (fashion + COD-heavy).
  // returnRate is entered as a percentage (e.g. 5 for 5%) — convert to decimal.
  const returnRateDecimal = (returnRate || 0) / 100;
  const rtoShare = orderType === 'COD' ? 0.45 : 0.25;
  const cogsLossRate = 0.40; // apparel returns often arrive unsellable
  const reverseLogisticsPerReturn = shippingFee;
  const rtoPenaltyPerReturn = shippingFee; // forward re-charged on RTO
  const perReturnLogistics = reverseLogisticsPerReturn + rtoShare * rtoPenaltyPerReturn;
  // Meesho has 0% commission so no commission clawback
  const cogsLossPerReturn = cogs * cogsLossRate;

  const returnLogisticsFee = round2(perReturnLogistics * returnRateDecimal);
  const returnImpact = round2(
    (perReturnLogistics + cogsLossPerReturn) * returnRateDecimal
  );

  const otherFees = 0;

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

  // Break-even price
  const proportionalRate = 0.01; // TCS only (returnImpact components are now fixed per-unit)
  const gstMultiplier = includeGSTAsFee ? 1.18 : 1;
  const fixedCosts = closingFee + shippingFee + codFee + shippingCostToBuyer + adsSpend + cogs + returnImpact;
  
  const fixedGSTCosts = includeGSTAsFee
    ? round2((closingFee + shippingFee + codFee) * 0.18)
    : 0;
    
  const breakEvenPrice =
    (1 - proportionalRate * gstMultiplier) > 0
      ? round2((fixedCosts + fixedGSTCosts) / (1 - proportionalRate * gstMultiplier))
      : 0;

  const contributionMargin =
    sellingPrice > 0 ? round2(((netPayout - cogs) / sellingPrice) * 100) : 0;

  const effectiveFeePercent =
    sellingPrice > 0 ? round2((totalDeductions / sellingPrice) * 100) : 0;

  return {
    platform: 'Meesho',
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
