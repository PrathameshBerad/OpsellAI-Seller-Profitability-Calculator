import { useMemo } from 'react';
import { calculateAll } from '../engines';

export function useCalculations(products, globalSettings) {
  const results = useMemo(() => {
    try {
      return calculateAll(products, globalSettings);
    } catch (e) {
      console.error('Calculation error:', e);
      return [];
    }
  }, [products, globalSettings]);

  const summary = useMemo(() => {
    if (results.length === 0) {
      return {
        hasResults: false,
        totalRevenue: 0,
        totalNetPayout: 0,
        totalNetProfit: 0,
        avgMargin: 0,
        bestPlatform: '-',
        worstPlatform: '-',
        uniquePlatformCount: 0,
      };
    }

    let totalRevenue = 0;
    let totalNetPayout = 0;
    let totalNetProfit = 0;

    const uniqueProducts = [...new Set(results.map(r => r.productId))];

    for (const pid of uniqueProducts) {
      const productResults = results.filter(r => r.productId === pid);
      if (productResults.length > 0) {
        // Selling price is the same across platforms for this product
        totalRevenue += productResults[0].sellingPrice;
        
        // For payout and profit, average them across the selected platforms for this product
        const avgPayout = productResults.reduce((sum, r) => sum + r.netPayout, 0) / productResults.length;
        const avgProfit = productResults.reduce((sum, r) => sum + r.netProfit, 0) / productResults.length;
        
        totalNetPayout += avgPayout;
        totalNetProfit += avgProfit;
      }
    }
    const avgMargin = results.reduce((sum, r) => sum + r.profitMargin, 0) / results.length;

    const platformMargins = {};
    const platformCounts = {};
    for (const r of results) {
      if (!platformMargins[r.platform]) {
        platformMargins[r.platform] = 0;
        platformCounts[r.platform] = 0;
      }
      platformMargins[r.platform] += r.profitMargin;
      platformCounts[r.platform]++;
    }

    let bestPlatform = '-';
    let worstPlatform = '-';
    let bestAvg = -Infinity;
    let worstAvg = Infinity;

    for (const [platform, totalMargin] of Object.entries(platformMargins)) {
      const avg = totalMargin / platformCounts[platform];
      if (avg > bestAvg) { bestAvg = avg; bestPlatform = platform; }
      if (avg < worstAvg) { worstAvg = avg; worstPlatform = platform; }
    }

    return { 
      hasResults: true,
      totalRevenue, 
      totalNetPayout, 
      totalNetProfit, 
      avgMargin, 
      bestPlatform, 
      worstPlatform,
      uniquePlatformCount: Object.keys(platformMargins).length
    };
  }, [results]);

  return { results, summary };
}
