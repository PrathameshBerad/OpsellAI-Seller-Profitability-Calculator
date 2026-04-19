// Walmart Fee Calculation Engine
// All monetary values in USD, weight input in grams

const GRAMS_PER_LB = 453.6;

function round2(val) {
  return Math.round(val * 100) / 100;
}

/**
 * Compute referral fee for Walmart based on category and selling price.
 * TIERED categories: different rates apply to different PORTIONS of the price.
 * Non-tiered: a single rate applies to the FULL price based on which bracket the price falls in.
 */
function computeReferralFee(category, price) {
  const cat = (category || 'Everything Else').trim();

  // Helper for tiered (marginal) calculations
  function tiered(brackets) {
    let fee = 0;
    let remaining = price;
    for (const b of brackets) {
      const portion = Math.min(remaining, b.upTo - (b.from || 0));
      if (portion <= 0) break;
      fee += portion * b.rate;
      remaining -= portion;
      if (remaining <= 0) break;
    }
    return fee;
  }

  let fee = 0;

  switch (cat) {
    case 'Apparel & Accessories':
      // TIERED: 5% <=15, 10% 15.01-20, 15% >20
      fee = tiered([
        { from: 0, upTo: 15, rate: 0.05 },
        { from: 15, upTo: 20, rate: 0.10 },
        { from: 20, upTo: Infinity, rate: 0.15 },
      ]);
      break;

    case 'Appliances - Compact':
    case 'Appliances – Compact':
      // TIERED: 12% on portion <=300, 8% on portion >300
      fee = tiered([
        { from: 0, upTo: 300, rate: 0.12 },
        { from: 300, upTo: Infinity, rate: 0.08 },
      ]);
      break;

    case 'Appliances - Major':
    case 'Appliances – Major':
      fee = price * 0.08;
      break;

    case 'Automotive & Powersports':
      fee = price * 0.12;
      break;

    case 'Baby Products':
      fee = price <= 10 ? price * 0.08 : price * 0.15;
      break;

    case 'Base Power Tools':
      fee = price * 0.12;
      break;

    case 'Beauty, Health & Personal Care':
      fee = price <= 10 ? price * 0.08 : price * 0.15;
      break;

    case 'Books':
      fee = price * 0.15;
      break;

    case 'Camera & Photo':
      fee = price * 0.08;
      break;

    case 'Collectibles':
      fee = price * 0.08;
      break;

    case 'Consumer Electronics':
      fee = price * 0.08;
      break;

    case 'Electronics Accessories':
      // TIERED: 15% on portion <=100, 8% on portion >100
      fee = tiered([
        { from: 0, upTo: 100, rate: 0.15 },
        { from: 100, upTo: Infinity, rate: 0.08 },
      ]);
      break;

    case 'Grocery':
      fee = price <= 15 ? price * 0.08 : price * 0.15;
      break;

    case 'Home, Kitchen, Decor & Garden':
      fee = price * 0.15;
      break;

    case 'Indoor & Outdoor Furniture':
      // TIERED: 15% on portion <=200, 10% on portion >200
      fee = tiered([
        { from: 0, upTo: 200, rate: 0.15 },
        { from: 200, upTo: Infinity, rate: 0.10 },
      ]);
      break;

    case 'Industrial & Scientific Supplies':
      fee = price * 0.12;
      break;

    case 'Jewelry & Precious Metals':
      // TIERED: 20% on portion <=250, 5% on portion >250
      fee = tiered([
        { from: 0, upTo: 250, rate: 0.20 },
        { from: 250, upTo: Infinity, rate: 0.05 },
      ]);
      break;

    case 'Luggage & Travel Accessories':
      fee = price * 0.15;
      break;

    case 'Music':
      fee = price * 0.15;
      break;

    case 'Musical Instruments':
      fee = price * 0.12;
      break;

    case 'Office Products':
      fee = price * 0.15;
      break;

    case 'Outdoor Power Tools':
      fee = price <= 500 ? price * 0.15 : price * 0.08;
      break;

    case 'Outdoors Products & Sports':
      fee = price * 0.15;
      break;

    case 'Personal Computers':
      fee = price * 0.06;
      break;

    case 'Pet Supplies':
      fee = price * 0.15;
      break;

    case 'Plumbing, Heating, Cooling & Ventilation':
      fee = price * 0.10;
      break;

    case 'Shoes, Handbags, Backpacks & Sunglasses':
      fee = price * 0.15;
      break;

    case 'Software & Computer Video Games':
      fee = price * 0.15;
      break;

    case 'Tires & Wheels':
      fee = price * 0.10;
      break;

    case 'Tools & Home Improvement':
      fee = price * 0.15;
      break;

    case 'Toys & Games':
      fee = price * 0.15;
      break;

    case 'Video & DVD':
      fee = price * 0.15;
      break;

    case 'Video Game Consoles':
      fee = price * 0.08;
      break;

    case 'Watches':
      // TIERED: 15% on portion <=1500, 3% on portion >1500
      fee = tiered([
        { from: 0, upTo: 1500, rate: 0.15 },
        { from: 1500, upTo: Infinity, rate: 0.03 },
      ]);
      break;

    default: // Everything Else
      fee = price * 0.15;
      break;
  }

  return fee;
}

/**
 * Compute WFS (Walmart Fulfillment Services) fee based on weight in grams.
 * Adds 0.25 lb packaging weight, rounds up to nearest lb.
 */
function computeWFSFee(weightGrams) {
  const weightLb = weightGrams / GRAMS_PER_LB;
  const shippingWeightLb = Math.ceil(weightLb + 0.25); // add packaging, round up

  if (shippingWeightLb <= 1) return 3.45;
  if (shippingWeightLb <= 2) return 4.95;
  if (shippingWeightLb <= 3) return 5.45;
  if (shippingWeightLb <= 20) return round2(5.75 + 0.40 * (shippingWeightLb - 4));
  if (shippingWeightLb <= 30) return round2(15.55 + 0.40 * (shippingWeightLb - 21));
  if (shippingWeightLb <= 50) return round2(14.55 + 0.40 * (shippingWeightLb - 31));
  // >=51 lb
  return round2(17.55 + 0.40 * (shippingWeightLb - 51));
}

/**
 * Main calculation function for Walmart.
 *
 * @param {Object} product - { sellingPrice, cogs, shippingCostToBuyer, category, weight, adsSpend, returnRate }
 * @param {Object} settings - { fulfillmentMethod: 'Self-Ship' | 'Platform Fulfillment' }
 * @returns {Object} BreakdownResult
 */
export function calculateWalmart(product, settings) {
  const {
    sellingPrice = 0,
    cogs = 0,
    shippingCostToBuyer = 0,
    category = 'Everything Else',
    weight = 0,
    adsSpend = 0,
    returnRate = 0,
  } = product || {};

  const fulfillmentMethod = (settings && settings.fulfillmentMethod) || 'Self-Ship';
  const isWFS = fulfillmentMethod === 'Platform Fulfillment';

  // Referral fee (Walmart has no minimum referral fee specified, no variable closing fee)
  const referralFee = round2(computeReferralFee(category, sellingPrice));
  const closingFee = 0; // Walmart has no variable closing fee

  // WFS fulfillment fee
  const fulfillmentFee = isWFS ? round2(computeWFSFee(weight)) : 0;

  // Shipping fee (seller-ship scenario)
  const shippingFee = round2(shippingCostToBuyer);

  // Not applicable for Walmart
  const weightHandlingFee = 0;
  const collectionFee = 0;
  const codFee = 0;
  const tcs = 0;
  const gstOnFees = 0;
  const otherFees = 0;

  // Ads spend
  const adsSpendVal = round2(adsSpend);

  // --- Return cost model ---
  // returnRate is a percentage (e.g. 5 for 5%). US prepaid, low RTO incidence.
  const returnRateDecimal = (returnRate || 0) / 100;
  const rtoShare = 0.04;
  const cogsLossRate = 0.22;
  // WFS: Walmart charges Returns Processing ≈ 50% of fulfillmentFee.
  // Self-Ship: seller bears ~$3 reverse-shipping cost.
  const reverseLogisticsPerReturn = isWFS ? fulfillmentFee * 0.5 : 3;
  const rtoPenaltyPerReturn = isWFS ? fulfillmentFee : 5;
  const perReturnLogistics = reverseLogisticsPerReturn + rtoShare * rtoPenaltyPerReturn;
  // Walmart typically refunds full commission on returns; no clawback
  const feeClawbackPerReturn = 0;
  const cogsLossPerReturn = cogs * cogsLossRate + shippingFee;

  const returnLogisticsFee = round2(perReturnLogistics * returnRateDecimal);
  const returnImpact = round2(
    (perReturnLogistics + feeClawbackPerReturn + cogsLossPerReturn) * returnRateDecimal
  );

  // Total deductions
  const totalDeductions = round2(
    referralFee +
    closingFee +
    weightHandlingFee +
    fulfillmentFee +
    shippingFee +
    collectionFee +
    codFee +
    tcs +
    gstOnFees +
    adsSpendVal +
    returnImpact +
    otherFees
  );

  // Net payout from the platform (before COGS)
  const netPayout = round2(sellingPrice - referralFee - closingFee - fulfillmentFee);

  // Gross profit = net payout - COGS - shipping
  const grossProfit = round2(netPayout - cogs - shippingFee);

  // Net profit = selling price - all deductions - COGS
  const netProfit = round2(sellingPrice - totalDeductions - cogs);

  // Profit margin (% of selling price)
  const profitMargin = sellingPrice > 0 ? round2((netProfit / sellingPrice) * 100) : 0;

  // ROI (% return on investment)
  const totalInvestment = cogs + shippingFee + adsSpendVal;
  const roi = totalInvestment > 0 ? round2((netProfit / totalInvestment) * 100) : 0;

  // Break-even price approximation
  const breakEvenPrice = round2(cogs + totalDeductions);

  // Contribution margin = (selling price - variable costs) / selling price * 100
  const variableCosts = referralFee + closingFee + fulfillmentFee + shippingFee + cogs;
  const contributionMargin = sellingPrice > 0 ? round2(((sellingPrice - variableCosts) / sellingPrice) * 100) : 0;

  // Effective fee percentage (platform fees as % of selling price)
  const platformFees = referralFee + closingFee + fulfillmentFee;
  const effectiveFeePercent = sellingPrice > 0 ? round2((platformFees / sellingPrice) * 100) : 0;

  return {
    platform: 'Walmart',
    currency: 'USD',
    sellingPrice: round2(sellingPrice),
    referralFee,
    closingFee,
    weightHandlingFee,
    fulfillmentFee,
    shippingFee,
    collectionFee,
    codFee,
    tcs,
    gstOnFees,
    adsSpend: adsSpendVal,
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
