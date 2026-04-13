import { useState } from 'react';
import PlatformBadge from './PlatformBadge';
import { PLATFORMS } from '../data/platforms';

function fmt(value, platformId) {
  const p = PLATFORMS[platformId];
  if (!p) return value.toFixed(2);
  if (p.currencySymbol === '$')   return `$${value.toFixed(2)}`;
  if (p.currencySymbol === 'AED') return `AED ${value.toFixed(2)}`;
  return `₹${value.toFixed(2)}`;
}

/* ── Stacked mini bar ────────────────────────────── */
function MiniBar({ result }) {
  const items = [
    { label: 'COGS',     value: result.cogs || 0,                                                                          color: '#475569' },
    { label: 'Referral', value: result.referralFee,                                                                        color: '#ef4444' },
    { label: 'Shipping', value: (result.shippingFee || 0) + (result.weightHandlingFee || 0) + (result.fulfillmentFee || 0), color: '#f97316' },
    { label: 'Other',    value: (result.closingFee || 0) + (result.collectionFee || 0) + (result.codFee || 0) + (result.tcs || 0) + (result.otherFees || 0), color: '#a855f7' },
    { label: 'Profit',   value: Math.max(0, result.netProfit),                                                             color: '#22c55e' },
  ].filter(i => i.value > 0);

  const total = items.reduce((s, i) => s + i.value, 0);
  if (total === 0) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 6, background: 'rgba(255,255,255,0.04)' }}>
        {items.map((item, i) => (
          <div
            key={i}
            title={`${item.label}: ${((item.value / total) * 100).toFixed(0)}%`}
            style={{
              width: `${(item.value / total) * 100}%`,
              backgroundColor: item.color,
              minWidth: item.value > 0 ? 2 : 0,
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 8 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'DM Sans' }}>
              {item.label} {((item.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Fee row ─────────────────────────────────────── */
function FeeRow({ label, amount, platformId, badge }) {
  const isZero = amount === 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '7px 0',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 13, color: isZero ? 'var(--text-muted)' : 'var(--text-secondary)', fontFamily: 'DM Sans' }}>
          {label}
        </span>
        {badge === 'Reclaimable' && <span className="badge-reclaimable">↩ Reclaimable</span>}
        {badge === 'Info'        && <span className="badge-info">ITC</span>}
      </div>
      <span style={{
        fontSize: 13, fontFamily: 'DM Mono', fontWeight: 500,
        color: isZero ? 'var(--text-muted)' : 'var(--accent-danger)',
        opacity: isZero ? 0.4 : 0.85,
      }}>
        {isZero ? '—' : `-${fmt(amount, platformId)}`}
      </span>
    </div>
  );
}

/* ── Per-platform panel ──────────────────────────── */
function PlatformPanel({ r }) {
  return (
    <div style={{
      borderRadius: 14,
      border: '1px solid rgba(255,255,255,0.05)',
      background: 'rgba(255,255,255,0.015)',
      padding: '16px',
      transition: 'border-color 200ms ease',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
    >
      {/* Platform + profit header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <PlatformBadge platformId={r.platform} size="md" />
        <div style={{ textAlign: 'right' }}>
          <p style={{
            fontSize: 20, fontFamily: 'DM Mono', fontWeight: 600,
            color: r.netProfit >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)',
            letterSpacing: '-0.02em', lineHeight: 1,
          }}>
            {fmt(r.netProfit, r.platform)}
          </p>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'DM Sans', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Net Profit
          </p>
        </div>
      </div>

      <MiniBar result={r} />

      {/* Line items */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'DM Sans', fontWeight: 600 }}>Selling Price</span>
          <span style={{ fontSize: 13, fontFamily: 'DM Mono', fontWeight: 500, color: 'var(--text-primary)' }}>{fmt(r.sellingPrice, r.platform)}</span>
        </div>

        <FeeRow label="Referral / Commission"    amount={r.referralFee}           platformId={r.platform} />
        <FeeRow label="Closing / Fixed Fee"      amount={r.closingFee}            platformId={r.platform} />
        {r.weightHandlingFee > 0 && <FeeRow label="Weight Handling"  amount={r.weightHandlingFee}  platformId={r.platform} />}
        {r.fulfillmentFee    > 0 && <FeeRow label="Fulfillment Fee"  amount={r.fulfillmentFee}     platformId={r.platform} />}
        {r.shippingFee       > 0 && <FeeRow label="Shipping"          amount={r.shippingFee}        platformId={r.platform} />}
        {r.collectionFee     > 0 && <FeeRow label="Collection Fee"    amount={r.collectionFee}      platformId={r.platform} />}
        {r.codFee            > 0 && <FeeRow label="COD Fee"           amount={r.codFee}             platformId={r.platform} />}
        {r.tcs               > 0 && <FeeRow label="TCS (1%)"          amount={r.tcs}                platformId={r.platform} badge="Reclaimable" />}
        {r.gstOnFees         > 0 && <FeeRow label="GST on Fees (18%)" amount={r.gstOnFees}          platformId={r.platform} badge="Info" />}
        {r.adsSpend          > 0 && <FeeRow label="Ads Spend"         amount={r.adsSpend}           platformId={r.platform} />}
        {r.returnImpact      > 0 && <FeeRow label="Return Impact"     amount={r.returnImpact}       platformId={r.platform} />}

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 2 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Sans', fontWeight: 600 }}>Total Deductions</span>
          <span style={{ fontSize: 13, fontFamily: 'DM Mono', fontWeight: 700, color: 'var(--accent-danger)' }}>
            -{fmt(r.totalDeductions, r.platform)}
          </span>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', padding: '10px 12px',
          borderRadius: 10,
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.15)',
          marginTop: 6,
        }}>
          <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'DM Sans', fontWeight: 700 }}>Net Payout</span>
          <span style={{ fontSize: 13, fontFamily: 'DM Mono', fontWeight: 700, color: 'var(--accent-secondary)' }}>
            {fmt(r.netPayout, r.platform)}
          </span>
        </div>
      </div>

      {/* Mini metrics footer */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: 8, marginTop: 12, paddingTop: 12,
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        {[
          { label: 'Margin', value: `${r.profitMargin.toFixed(1)}%`,       color: r.profitMargin >= 20 ? 'var(--accent-success)' : r.profitMargin >= 10 ? 'var(--accent-warning)' : 'var(--accent-danger)' },
          { label: 'ROI',    value: `${r.roi.toFixed(1)}%`,                  color: r.roi >= 25         ? 'var(--accent-success)' : r.roi >= 10           ? 'var(--accent-warning)' : 'var(--accent-danger)' },
          { label: 'Fee %',  value: `${r.effectiveFeePercent.toFixed(1)}%`, color: 'var(--text-secondary)' },
        ].map(m => (
          <div key={m.label} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'DM Sans', marginBottom: 3 }}>{m.label}</p>
            <p style={{ fontSize: 13, fontFamily: 'DM Mono', fontWeight: 700, color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main FeeBreakdownCard ───────────────────────── */
export default function FeeBreakdownCard({ productName, results }) {
  const [expanded, setExpanded] = useState(true);
  if (!results || results.length === 0) return null;

  return (
    <div className="breakdown-card">
      {/* Collapsible header */}
      <button className="breakdown-header" onClick={() => setExpanded(!expanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
            {productName}
          </span>
          <span style={{
            fontSize: 11, fontFamily: 'DM Sans', color: 'var(--text-muted)',
            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
            padding: '2px 8px', borderRadius: 6,
          }}>
            {results.length} platform{results.length !== 1 ? 's' : ''}
          </span>
        </div>
        <span className={`chevron${expanded ? ' open' : ''}`}>▾</span>
      </button>

      {expanded && (
        <div className="animate-open" style={{ padding: '0 20px 20px', overflow: 'hidden' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: results.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 14,
          }}>
            {results.map(r => (
              <PlatformPanel key={r.platform} r={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
