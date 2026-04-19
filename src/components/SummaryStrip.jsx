import { useEffect, useRef, useState } from 'react';
import { IconDollar, IconPayout, IconTrendingUp, IconPercent } from './Icon';

/* ── Animated number ──────────────────────────────── */
function AnimatedValue({ value, style }) {
  const [key, setKey] = useState(0);
  const prevRef = useRef(value);
  useEffect(() => {
    if (prevRef.current !== value) { setKey(k => k + 1); prevRef.current = value; }
  }, [value]);
  return (
    <span key={key} className="animate-number" style={style}>
      {value}
    </span>
  );
}

/* ── Metric Card ──────────────────────────────────── */
function MetricCard({ label, value, subtext, barClass, Icon, valueColor, iconColor }) {
  return (
    <div className={`metric-card ${barClass}`} role="group" aria-label={label}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: 'var(--text-muted)',
          fontFamily: 'DM Sans, sans-serif',
        }}>
          {label}
        </p>
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 26, height: 26, borderRadius: 8,
            background: `${iconColor}14`,
            color: iconColor,
          }}
          aria-hidden="true"
        >
          <Icon size={14} />
        </span>
      </div>
      <AnimatedValue
        value={value}
        style={{
          display: 'block',
          fontFamily: 'DM Mono, monospace',
          fontWeight: 600,
          fontSize: 24,
          letterSpacing: '-0.02em',
          color: valueColor || 'var(--text-primary)',
          lineHeight: 1.1,
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum", "lnum", "zero" 0',
        }}
      />
      {subtext && (
        <p style={{
          fontSize: 11, color: 'var(--text-muted)', marginTop: 6,
          fontFamily: 'DM Sans, sans-serif',
        }}>
          {subtext}
        </p>
      )}
    </div>
  );
}

/* ── SummaryStrip ─────────────────────────────────── */
export default function SummaryStrip({ summary }) {
  const marginColor =
    summary.avgMargin >= 20 ? 'var(--accent-success)' :
    summary.avgMargin >= 10 ? 'var(--accent-warning)' :
    'var(--accent-danger)';

  const profitColor = summary.totalNetProfit >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)';
  const fmt = v => v.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <div
      className="summary-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
        marginBottom: 28,
      }}
    >
      <style>{`
        @media (min-width: 768px)  { .summary-grid { grid-template-columns: repeat(2,1fr); } }
        @media (min-width: 1280px) { .summary-grid { grid-template-columns: repeat(4,1fr); } }
      `}</style>

      <MetricCard
        label="Revenue"
        value={!summary.hasResults ? '—' : fmt(summary.totalRevenue)}
        subtext="All calculations"
        barClass="metric-bar-primary"
        Icon={IconDollar}
        iconColor="#818cf8"
        valueColor="var(--text-primary)"
      />
      <MetricCard
        label="Net Payout"
        value={!summary.hasResults ? '—' : fmt(summary.totalNetPayout)}
        subtext="After platform fees"
        barClass="metric-bar-cyan"
        Icon={IconPayout}
        iconColor="var(--accent-secondary)"
        valueColor="var(--accent-secondary)"
      />
      <MetricCard
        label="Net Profit"
        value={!summary.hasResults ? '—' : fmt(summary.totalNetProfit)}
        subtext="After all costs"
        barClass={!summary.hasResults ? 'metric-bar-muted' : (summary.totalNetProfit >= 0 ? 'metric-bar-success' : 'metric-bar-danger')}
        Icon={IconTrendingUp}
        iconColor={summary.totalNetProfit >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)'}
        valueColor={profitColor}
      />
      <MetricCard
        label="Avg Margin"
        value={!summary.hasResults ? '—' : `${summary.avgMargin.toFixed(1)}%`}
        subtext={summary.avgMargin >= 20 ? 'Healthy' : summary.avgMargin >= 10 ? 'Tight' : 'At risk'}
        barClass={
          !summary.hasResults ? 'metric-bar-muted' :
          summary.avgMargin >= 20 ? 'metric-bar-success' :
          summary.avgMargin >= 10 ? 'metric-bar-warning' :
          'metric-bar-danger'
        }
        Icon={IconPercent}
        iconColor={marginColor}
        valueColor={marginColor}
      />
    </div>
  );
}
