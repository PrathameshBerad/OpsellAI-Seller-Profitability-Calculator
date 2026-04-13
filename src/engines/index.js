import { calculateAmazonIndia } from './amazonIndia';
import { calculateAmazonUSA } from './amazonUSA';
import { calculateFlipkart } from './flipkart';
import { calculateShopsy } from './shopsy';
import { calculateNoonUAE } from './noonUAE';
import { calculateWalmart } from './walmart';
import { calculateEbay } from './ebay';

const engineMap = {
  amazonIndia: calculateAmazonIndia,
  amazonUSA: calculateAmazonUSA,
  flipkart: calculateFlipkart,
  shopsy: calculateShopsy,
  noonUAE: calculateNoonUAE,
  walmart: calculateWalmart,
  ebay: calculateEbay,
};

export function calculateForPlatform(platformId, product, settings) {
  const engine = engineMap[platformId];
  if (!engine) return null;
  return engine(product, settings);
}

export function calculateAll(products) {
  const results = [];
  for (const product of products) {
    for (const platformId of product.selectedPlatforms) {
      const settings = product.platformSettings[platformId] || {};
      const result = calculateForPlatform(platformId, product, settings);
      if (result) {
        results.push({
          ...result,
          productId: product.id,
          productName: product.name,
        });
      }
    }
  }
  return results;
}
