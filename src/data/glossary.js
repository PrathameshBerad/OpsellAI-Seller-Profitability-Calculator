// Plain-English glossary for novice sellers.
// Used by <Tip term="..."> to swap jargon for recognizable language.
// Keep copy under 18 words per entry so tooltips stay scannable on mobile.

const GLOSSARY = {
  referral: {
    label: 'Referral / Commission',
    text: 'Marketplace cut — a % of your selling price, charged per sale. Biggest fee on most platforms.',
  },
  closing: {
    label: 'Closing / Fixed Fee',
    text: 'A flat per-order fee the platform charges regardless of price. Sometimes bundled with shipping.',
  },
  weight: {
    label: 'Weight Handling',
    text: 'Fulfilment fee based on your item\'s weight and size. Higher for heavy or bulky products.',
  },
  fulfillment: {
    label: 'Fulfillment Fee',
    text: 'Charged when the platform picks, packs, and ships for you (e.g. FBA, Flipkart FA).',
  },
  shipping: {
    label: 'Shipping',
    text: 'What the platform charges you to deliver to the buyer. Varies by zone and weight.',
  },
  collection: {
    label: 'Collection Fee',
    text: 'Small per-order fee for handling the payment — usually a % of selling price.',
  },
  cod: {
    label: 'COD Fee',
    text: 'Extra cash-on-delivery fee. Only charged when the buyer pays the courier in cash.',
  },
  tcs: {
    label: 'TCS — Tax Collected at Source',
    text: '1% GST the marketplace withholds and pays the government. You can claim it back in your GST return.',
  },
  gstFees: {
    label: 'GST on Fees (18%)',
    text: '18% GST the platform charges on top of its own fees. Reclaimable as Input Tax Credit if you file GST.',
  },
  itc: {
    label: 'ITC — Input Tax Credit',
    text: 'Offset GST you paid on business expenses against the GST you collect from buyers.',
  },
  adsSpend: {
    label: 'Ads Spend',
    text: 'Your allocated ad cost per unit (Sponsored Products, Flipkart PLA, etc.). Lowers net profit.',
  },
  returnImpact: {
    label: 'Return Impact',
    text: 'Expected loss from returns at your return rate — covers lost profit, reverse shipping, and RTO fees.',
  },
  margin: {
    label: 'Profit Margin',
    text: 'Net profit ÷ selling price. A quick health-check: above 20% is strong, under 10% is risky.',
  },
  roi: {
    label: 'ROI — Return on Investment',
    text: 'Net profit ÷ cost of goods. Tells you how hard each rupee spent is working for you.',
  },
  effectiveFee: {
    label: 'Effective Fee %',
    text: 'All platform fees as a % of selling price. Lower is better — use it to compare marketplaces fairly.',
  },
  netPayout: {
    label: 'Net Payout',
    text: 'What the marketplace actually settles to your bank account — selling price minus all fees.',
  },
  returnRate: {
    label: 'Return Rate',
    text: 'Share of orders that come back. 1 = 1%, 5 = 5%. Fashion typically runs 20–40%.',
  },
};

export default GLOSSARY;
