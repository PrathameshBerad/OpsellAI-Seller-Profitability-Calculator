import { useState, useMemo } from 'react';
import PlatformBadge from './PlatformBadge';
import { PLATFORMS } from '../data/platforms';

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
  return (
    <span style={{ marginLeft: 5, fontSize: 10, opacity: active ? 1 : 0.3, color: active ? 'var(--accent-primary)' : 'inherit' }}>
      {active ? (dir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );
}

export default function ComparisonTable({ results }) {
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
        <div style={{ fontSize: 44, marginBottom: 16, opacity: 0.1 }}>◎</div>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: 14, marginBottom: 6 }}>
          No results yet
        </p>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: 12, opacity: 0.7 }}>
          Select platforms and fill in product details to see the comparison
        </p>
      </div>
    );
  }

  const columns = [
    { key: 'productName',        label: 'Product',  sortable: false },
    { key: 'platform',           label: 'Platform', sortable: false },
    { key: 'sellingPrice',       label: 'Price'  },
    { key: 'totalDeductions',    label: 'Fees'   },
    { key: 'effectiveFeePercent',label: 'Fee %'  },
    { key: 'netPayout',          label: 'Payout' },
    { key: 'netProfit',          label: 'Profit' },
    { key: 'profitMargin',       label: 'Margin' },
    { key: 'roi',                label: 'ROI'    },
  ];

  return (
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
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8,
              border: '1px solid var(--glass-border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontFamily: 'DM Sans', fontWeight: 500, fontSize: 12,
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
            ↓ Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                  style={{ cursor: col.sortable !== false ? 'pointer' : 'default' }}
                >
                  {col.label}
                  {col.sortable !== false && <SortIcon active={sortKey === col.key} dir={sortDir} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, idx) => {
              const rowKey = `${r.productId}-${r.platform}`;
              const isBest = bestPerProduct.has(rowKey);
              const roiColor = r.roi >= 25 ? 'var(--accent-success)' : r.roi >= 10 ? 'var(--accent-warning)' : 'var(--accent-danger)';

              return (
                <tr key={rowKey} className={isBest ? 'best-row' : ''}>
                  <td style={{
                    fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                    fontSize: 13, color: 'var(--text-primary)',
                  }}>
                    {r.productName}
                  </td>
                  <td><PlatformBadge platformId={r.platform} /></td>
                  <td style={{ fontFamily: 'DM Mono', color: 'var(--text-secondary)' }}>
                    {formatCurrency(r.sellingPrice, r.platform)}
                  </td>
                  <td style={{ fontFamily: 'DM Mono', color: 'var(--accent-danger)', opacity: 0.85 }}>
                    -{formatCurrency(r.totalDeductions, r.platform)}
                  </td>
                  <td style={{ fontFamily: 'DM Mono', color: 'var(--text-muted)' }}>
                    {r.effectiveFeePercent.toFixed(1)}%
                  </td>
                  <td style={{ fontFamily: 'DM Mono', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {formatCurrency(r.netPayout, r.platform)}
                  </td>
                  <td style={{ fontFamily: 'DM Mono', fontWeight: 600, color: r.netProfit >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                    {formatCurrency(r.netProfit, r.platform)}
                    {isBest && <span className="best-star">★</span>}
                  </td>
                  <td>
                    <MarginPill value={r.profitMargin} />
                  </td>
                  <td style={{ fontFamily: 'DM Mono', fontWeight: 600, color: roiColor }}>
                    {r.roi.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
