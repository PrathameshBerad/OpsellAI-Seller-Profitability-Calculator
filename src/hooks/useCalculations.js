import { useMemo } from 'react';
import { calculateAll } from '../engines';

export function useCalculations(products) {
  const results = useMemo(() => {
    try {
      return calculateAll(products);
    } catch (e) {
      console.error('Calculation error:', e);
      return [];
    }
  }, [products]);

  const summary = useMemo(() => {
    if (results.length === 0) {
      return {
        totalRevenue: 0,
        totalNetPayout: 0,
        totalNetProfit: 0,
        avgMargin: 0,
        bestPlatform: '-',
        worstPlatform: '-',
      };
    }

    const totalRevenue = results.reduce((sum, r) => sum + r.sellingPrice, 0);
    const totalNetPayout = results.reduce((sum, r) => sum + r.netPayout, 0);
    const totalNetProfit = results.reduce((sum, r) => sum + r.netProfit, 0);
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

    return { totalRevenue, totalNetPayout, totalNetProfit, avgMargin, bestPlatform, worstPlatform };
  }, [results]);

  return { results, summary };
}
