import { useState, useMemo } from 'react';
import PlatformBadge from './PlatformBadge';
import { PLATFORMS } from '../data/platforms';
import { IconArrowUp, IconArrowDown, IconArrowUpDown, IconDownload, IconCrown, IconCheck, IconSparkle } from './Icon';

function formatCurrency(value, platformId) {
  const p = PLATFORMS[platformId];
  if (!p) return value.toFixed(2);
  if (p.currencySymbol === '$')   return `$${value.toFixed(2)}`;
  if (p.currencySymbol === 'AED') return `AED ${value.toFixed(2)}`;
  return `₹${value.toFixed(2)}`;
}

function MarginPill({ value }) {
  const cls = value >= 20 ? 'pill-success' : value >= 10 ? 'pill-warning' : 'pill-danger';
  return <span className={`pill ${cls}`}>{value.toFixed(1)}%</span>;
}

function SortIcon({ active, dir }) {
  const color = active ? 'var(--accent-primary)' : 'currentColor';
  const opacity = active ? 1 : 0.35;
  const Icon = !active ? IconArrowUpDown : dir === 'asc' ? IconArrowUp : IconArrowDown;
  return (
    <span style={{
      marginLeft: 5, display: 'inline-flex', alignItems: 'center',
      color, opacity,
    }}>
      <Icon size={10} />
    </span>
  );
}

export default function ComparisonTable({ results, summary }) {
  const [sortKey, setSortKey]           = useState('netProfit');
  const [sortDir, setSortDir]           = useState('desc');
  const [highlightMetric, setHighlight] = useState('netProfit');

  const sorted = useMemo(() => (
    [...results].sort((a, b) => {
      const av = a[sortKey] ?? 0, bv = b[sortKey] ?? 0;
      return sortDir === 'asc' ? av - bv : bv - av;
    })
  ), [results, sortKey, sortDir]);

  const bestPerProduct = useMemo(() => {
    const map = {};
    for (const r of results) {
      const better = highlightMetric === 'effectiveFeePercent'
        ? (!map[r.productId] || r[highlightMetric] < map[r.productId][highlightMetric])
        : (!map[r.productId] || r[highlightMetric] > map[r.productId][highlightMetric]);
      if (better) map[r.productId] = r;
    }
    return new Set(Object.values(map).map(r => `${r.productId}-${r.platform}`));
  }, [results, highlightMetric]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const exportCSV = () => {
    const headers = ['Product', 'Platform', 'Price', 'Fees', 'Fee%', 'Payout', 'Profit', 'Margin%', 'ROI%'];
    const rows = sorted.map(r =>
      [r.productName, r.platform, r.sellingPrice, r.totalDeductions,
       r.effectiveFeePercent, r.netPayout, r.netProfit, r.profitMargin, r.roi]
      .map(v => typeof v === 'number' ? v.toFixed(2) : v)
    );
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'opsellai-profitability-report.csv';
    a.click();
  };

  if (results.length === 0) {
    return (
      <div className="empty-state">
        <div style={{
          margin: '0 auto 16px', width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(148,163,184,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)',
        }}>
          <IconSparkle size={20} />
        </div>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'DM Sans', fontSize: 14, marginBottom: 6 }}>
          No results yet
        </p>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: 12 }}>
          Select platforms and fill in product details to see the comparison
        </p>
      </div>
    );
  }

  const columns = [
    { key: 'productName',        label: 'Product',  sortable: false },
    { key: 'platform',           label: 'Platform', sortable: false },
    { key: 'sellingPrice',       label: 'Price',  align: 'right' },
    { key: 'totalDeductions',    label: 'Fees',   align: 'right' },
    { key: 'effectiveFeePercent',label: 'Fee %',  align: 'right' },
    { key: 'netPayout',          label: 'Payout', align: 'right' },
    { key: 'netProfit',          label: 'Profit', align: 'right' },
    { key: 'profitMargin',       label: 'Margin', align: 'right' },
    { key: 'roi',                label: 'ROI',    align: 'right' },
  ];

  return (
    <div>
      {/* ── Best Platform Hero Banner ── */}
      {summary && summary.hasResults && summary.uniquePlatformCount >= 2 && summary.bestPlatform !== '-' && (
        <div
          className="animate-card"
          role="region"
          aria-label="Top performing platform"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            padding: '16px 20px', borderRadius: 16, marginBottom: 20,
            background: `linear-gradient(90deg, ${PLATFORMS[summary.bestPlatform]?.color}15 0%, rgba(255,255,255,0.02) 100%)`,
            border: `1px solid ${PLATFORMS[summary.bestPlatform]?.color}30`,
            borderLeft: `4px solid ${PLATFORMS[summary.bestPlatform]?.color}`,
            boxShadow: `0 8px 32px ${PLATFORMS[summary.bestPlatform]?.color}15`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span
              aria-hidden="true"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 42, height: 42, borderRadius: 12,
                background: `${PLATFORMS[summary.bestPlatform]?.color}22`,
                color: PLATFORMS[summary.bestPlatform]?.color,
                flexShrink: 0,
              }}
            >
              <IconCrown size={20} />
            </span>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Sans', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Top performing platform
              </p>
              <h3 style={{ fontSize: 18, fontFamily: 'Sora', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                {PLATFORMS[summary.bestPlatform]?.name}
              </h3>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
             <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Sans', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Avg Margin</p>
             <p style={{ fontSize: 22, fontFamily: 'DM Mono', fontWeight: 600, color: 'var(--accent-warning)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
               {summary.avgMargin.toFixed(1)}%
             </p>
          </div>
        </div>
      )}

    <div style={{
      background: 'var(--bg-surface-2)',
      border: '1px solid var(--glass-border)',
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      {/* Table header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: '1px solid var(--glass-border)',
        background: 'var(--bg-surface-1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 14,
            color: 'var(--text-primary)',
          }}>Results</span>
          <span style={{
            fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Sans',
            padding: '2px 8px', borderRadius: 6,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--glass-border)',
          }}>
            {results.length} {results.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Highlight metric selector */}
          <select
            value={highlightMetric}
            onChange={e => setHighlight(e.target.value)}
            aria-label="Metric to highlight in comparison table"
            className="input-field select-base"
            style={{ width: 'auto', fontSize: 12, padding: '6px 28px 6px 10px' }}
          >
            <option value="netProfit">Highlight: Best Profit</option>
            <option value="profitMargin">Highlight: Best Margin</option>
            <option value="roi">Highlight: Best ROI</option>
            <option value="effectiveFeePercent">Highlight: Lowest Fees</option>
          </select>
          {/* CSV Export */}
          <button
            onClick={exportCSV}
            aria-label="Export results as CSV"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8, minHeight: 34,
              border: '1px solid var(--glass-border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontFamily: 'DM Sans', fontWeight: 600, fontSize: 12,
              cursor: 'pointer', transition: 'all 180ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--accent-primary)';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--glass-border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <IconDownload size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table stack-on-mobile">
          <thead>
            <tr>
              {columns.map(col => {
                const isSorted = sortKey === col.key;
                const ariaSort = col.sortable === false
                  ? undefined
                  : isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none';
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={ariaSort}
                    onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                    onKeyDown={col.sortable !== false ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort(col.key); } } : undefined}
                    tabIndex={col.sortable !== false ? 0 : -1}
                    style={{ cursor: col.sortable !== false ? 'pointer' : 'default', textAlign: col.align || 'left' }}
                  >
                    {col.label}
                    {col.sortable !== false && <SortIcon active={isSorted} dir={sortDir} />}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, idx) => {
              const rowKey = `${r.productId}-${r.platform}`;
              const isBest = bestPerProduct.has(rowKey);
              const roiColor = r.roi >= 25 ? 'var(--accent-success)' : r.roi >= 10 ? 'var(--accent-warning)' : 'var(--accent-danger)';

              return (
                <tr key={rowKey} className={isBest ? 'best-row' : ''} style={isBest ? { borderLeft: `3px solid ${PLATFORMS[r.platform]?.color}` } : {}}>
                  <td data-label="Product" style={{
                    fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                    fontSize: 13, color: 'var(--text-primary)',
                  }}>
                    {r.productName}
                  </td>
                  <td data-label="Platform"><PlatformBadge platformId={r.platform} /></td>
                  <td data-label="Selling price" style={{ fontFamily: 'DM Mono', color: 'var(--text-secondary)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(r.sellingPrice, r.platform)}
                  </td>
                  <td data-label="Deductions" style={{ fontFamily: 'DM Mono', color: 'var(--accent-danger)', opacity: 0.85, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    -{formatCurrency(r.totalDeductions, r.platform)}
                  </td>
                  <td data-label="Fee %" style={{ fontFamily: 'DM Mono', color: 'var(--text-muted)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {r.effectiveFeePercent.toFixed(1)}%
                  </td>
                  <td data-label="Net payout" style={{ fontFamily: 'DM Mono', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(r.netPayout, r.platform)}
                  </td>
                  <td data-label="Net profit" style={{ fontFamily: 'DM Mono', fontWeight: 600, color: r.netProfit >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(r.netProfit, r.platform)}
                    {isBest && (
                      <span className="best-star" title="Best profit for this product" aria-label="Best profit">
                        <IconCheck size={11} style={{ marginLeft: 4 }} />
                      </span>
                    )}
                  </td>
                  <td data-label="Margin" style={{ textAlign: 'right' }}>
                    <MarginPill value={r.profitMargin} />
                  </td>
                  <td data-label="ROI" style={{ fontFamily: 'DM Mono', fontWeight: 600, color: roiColor, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {r.roi.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Trust Signals Footer */}
      <div style={{ marginTop: 12, padding: '0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Sans' }}>
          * Fees verified {typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : 'recently'}. Source: Official Seller Hubs.
        </p>
      </div>

      {/* TOFU Acquisition CTA */}
      <div
        className="animate-fade"
        style={{
          margin: '24px 20px 20px', padding: '22px 24px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.02) 100%)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}
      >
        <div style={{ flex: '1 1 260px' }}>
          <h4 style={{ fontFamily: 'Sora', fontSize: 16, fontWeight: 600, color: '#c7d2fe', marginBottom: 4, letterSpacing: '-0.01em' }}>
            Opsell automates this for every SKU across every marketplace.
          </h4>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Sans' }}>
            Stop calculating margins manually. Connect your seller accounts and let Opsell track your real-time profitability.
          </p>
        </div>
        <button className="btn btn-primary" style={{ flex: '0 0 auto' }}>
          Try Opsell Free
          <IconArrowUp size={13} style={{ transform: 'rotate(45deg)' }} />
        </button>
      </div>
      </div>
    </div>
  );
}
