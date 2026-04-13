// Amazon USA Fee Calculation Engine
// All monetary values in USD, weight input in grams

const GRAMS_PER_OZ = 28.35;
const GRAMS_PER_LB = 453.6;

function round2(val) {
  return Math.round(val * 100) / 100;
}

/**
 * Compute referral fee for Amazon USA based on category and selling price.
 * TIERED categories: different rates apply to different PORTIONS of the price.
 * Non-tiered: a single rate applies to the FULL price based on which bracket the price falls in.
 */
function computeReferralFee(category, price) {
  const cat = (category || 'Everything Else').trim();

  // Helper for tiered (marginal) calculations
  function tiered(brackets) {
    // brackets: [ { upTo, rate }, ... ] last one has upTo = Infinity
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
  let minFee = 0.30; // default minimum
  let closingFee = 0;

  switch (cat) {
    case 'Amazon Device Accessories':
      fee = price * 0.45;
      minFee = 0.30;
      break;

    case 'Amazon Handmade':
      fee = price * 0.15;
      minFee = 1.00;
      break;

    case 'Apparel & Accessories':
      // TIERED: 5% on portion <=15, 10% on portion 15.01-20, 17% on portion >20
      fee = tiered([
        { from: 0, upTo: 15, rate: 0.05 },
        { from: 15, upTo: 20, rate: 0.10 },
        { from: 20, upTo: Infinity, rate: 0.17 },
      ]);
      break;

    case 'Appliances - Compact':
    case 'Appliances – Compact':
      // TIERED: 15% on portion <=300, 8% on portion >300
      fee = tiered([
        { from: 0, upTo: 300, rate: 0.15 },
        { from: 300, upTo: Infinity, rate: 0.08 },
      ]);
      break;

    case 'Automotive & Powersports':
      fee = price * 0.12;
      break;

    case 'Baby Products':
      fee = price <= 10 ? price * 0.08 : price * 0.15;
      break;

    case 'Beauty & Personal Care':
      fee = price <= 10 ? price * 0.08 : price * 0.15;
      break;

    case 'Books':
      fee = price * 0.15;
      closingFee = 1.80;
      break;

    case 'Camera & Photo':
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

    case 'Grocery & Gourmet Food':
      fee = price <= 15 ? price * 0.08 : price * 0.15;
      minFee = 0; // no minimum
      break;

    case 'Home & Kitchen':
      fee = price * 0.15;
      break;

    case 'Indoor & Outdoor Furniture':
      // TIERED: 15% on portion <=200, 10% on portion >200
      fee = tiered([
        { from: 0, upTo: 200, rate: 0.15 },
        { from: 200, upTo: Infinity, rate: 0.10 },
      ]);
      break;

    case 'Industrial & Scientific':
      fee = price * 0.12;
      break;

    case 'Jewelry':
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
      closingFee = 1.80;
      break;

    case 'Musical Instruments':
      fee = price * 0.15;
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

    case 'Personal Computers (Laptops)':
    case 'Personal Computers':
      fee = price * 0.06;
      break;

    case 'Pet Supplies':
      fee = price * 0.15;
      break;

    case 'Shoes, Handbags, Backpacks, Sunglasses':
      fee = price * 0.15;
      break;

    case 'Software & Computer Video Games':
      fee = price * 0.15;
      closingFee = 1.80;
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
      closingFee = 1.80;
      break;

    case 'Video Game Consoles':
      fee = price * 0.08;
      break;

    case 'Watches':
      // TIERED: 16% on portion <=1500, 3% on portion >1500
      fee = tiered([
        { from: 0, upTo: 1500, rate: 0.16 },
        { from: 1500, upTo: Infinity, rate: 0.03 },
      ]);
      break;

    default: // Everything Else
      fee = price * 0.15;
      break;
  }

  // Apply minimum referral fee
  fee = Math.max(fee, minFee);

  return { referralFee: fee, closingFee };
}

/**
 * Compute FBA fulfillment fee based on weight in grams.
 * Uses weight to classify: <=453g (16oz) -> Small Standard, >453g -> Large Standard.
 */
function computeFBAFee(weightGrams) {
  const weightOz = weightGrams / GRAMS_PER_OZ;
  const weightLb = weightGrams / GRAMS_PER_LB;

  if (weightGrams <= 453) {
    // Small Standard (<=16oz)
    if (weightOz <= 4) return 3.22;
    if (weightOz <= 8) return 3.40;
    if (weightOz <= 12) return 3.58;
    return 3.77; // 12-16oz
  }

  // Large Standard (>16oz, up to 20lb)
  if (weightOz <= 4) return 3.86;   // unlikely for large but per spec
  if (weightOz <= 8) return 4.08;
  if (weightOz <= 16) return 4.75;
  if (weightLb <= 1.5) return 5.40;
  if (weightLb <= 2) return 5.69;
  if (weightLb <= 3) return 6.10;
  // 3-20lb: $6.39 + $0.16/lb over 3
  return round2(6.39 + 0.16 * (weightLb - 3));
}

/**
 * Main calculation function for Amazon USA.
 *
 * @param {Object} product - { sellingPrice, cogs, shippingCostToBuyer, category, weight, adsSpend, returnRate }
 * @param {Object} settings - { fulfillmentMethod: 'Self-Ship' | 'Platform Fulfillment' }
 * @returns {Object} BreakdownResult
 */
export function calculateAmazonUSA(product, settings) {
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
  const isFBA = fulfillmentMethod === 'Platform Fulfillment';

  // Referral fee & variable closing fee
  const { referralFee: rawReferralFee, closingFee: rawClosingFee } = computeReferralFee(category, sellingPrice);
  const referralFee = round2(rawReferralFee);
  const closingFee = round2(rawClosingFee);

  // FBA fulfillment fee
  const fulfillmentFee = isFBA ? round2(computeFBAFee(weight)) : 0;

  // Shipping fee (seller-ship scenario: buyer-facing shipping cost is a cost to the seller)
  const shippingFee = round2(shippingCostToBuyer);

  // Not applicable for Amazon USA
  const weightHandlingFee = 0;
  const collectionFee = 0;
  const codFee = 0;
  const tcs = 0;
  const gstOnFees = 0;
  const otherFees = 0;

  // Ads spend
  const adsSpendVal = round2(adsSpend);

  // Return impact: estimated cost of returns as returnRate% of selling price
  const returnImpact = round2(sellingPrice * (returnRate / 100));

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

  // ROI (% return on investment = net profit / total cost invested)
  const totalInvestment = cogs + shippingFee + adsSpendVal;
  const roi = totalInvestment > 0 ? round2((netProfit / totalInvestment) * 100) : 0;

  // Break-even price: the minimum selling price where net profit = 0
  // Approximation: totalDeductions scale with price (referral %) plus fixed fees
  // For simplicity: breakEven = cogs + totalDeductions (at current price point)
  const breakEvenPrice = round2(cogs + totalDeductions);

  // Contribution margin = (selling price - variable costs) / selling price * 100
  const variableCosts = referralFee + closingFee + fulfillmentFee + shippingFee + cogs;
  const contributionMargin = sellingPrice > 0 ? round2(((sellingPrice - variableCosts) / sellingPrice) * 100) : 0;

  // Effective fee percentage (platform fees as % of selling price)
  const platformFees = referralFee + closingFee + fulfillmentFee;
  const effectiveFeePercent = sellingPrice > 0 ? round2((platformFees / sellingPrice) * 100) : 0;

  return {
    platform: 'Amazon USA',
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
