import { useEffect, useRef, useState } from 'react';
import { PLATFORMS } from '../data/platforms';

/* ── Animated number ──────────────────────────────── */
function AnimatedValue({ value, className, style }) {
  const [key, setKey] = useState(0);
  const prevRef = useRef(value);
  useEffect(() => {
    if (prevRef.current !== value) { setKey(k => k + 1); prevRef.current = value; }
  }, [value]);
  return (
    <span key={key} className={`animate-number ${className || ''}`} style={style}>
      {value}
    </span>
  );
}

/* ── Metric Card ──────────────────────────────────── */
function MetricCard({ label, value, subtext, barClass, icon, valueColor }) {
  return (
    <div className={`metric-card ${barClass}`}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{
          fontSize: 10, fontWeight: 500, textTransform: 'uppercase',
          letterSpacing: '0.09em', color: 'var(--text-muted)',
          fontFamily: 'DM Sans, sans-serif',
        }}>
          {label}
        </p>
        <span style={{ fontSize: 16, opacity: 0.18, lineHeight: 1 }}>{icon}</span>
      </div>
      <AnimatedValue
        value={value}
        style={{
          display: 'block',
          fontFamily: 'DM Mono, monospace',
          fontWeight: 600,
          fontSize: 22,
          letterSpacing: '-0.02em',
          color: valueColor || 'var(--text-primary)',
          lineHeight: 1.1,
        }}
      />
      {subtext && (
        <p style={{
          fontSize: 11, color: 'var(--text-muted)', marginTop: 5,
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
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 12,
      marginBottom: 28,
    }}
    className="summary-grid"
    >
      <style>{`
        @media (min-width: 768px)  { .summary-grid { grid-template-columns: repeat(3,1fr); } }
        @media (min-width: 1280px) { .summary-grid { grid-template-columns: repeat(6,1fr); } }
      `}</style>

      <MetricCard
        label="Revenue"
        value={fmt(summary.totalRevenue)}
        subtext="All calculations"
        barClass="metric-bar-primary"
        icon="$"
        valueColor="var(--text-primary)"
      />
      <MetricCard
        label="Net Payout"
        value={fmt(summary.totalNetPayout)}
        barClass="metric-bar-cyan"
        icon="↓"
        valueColor="var(--accent-secondary)"
      />
      <MetricCard
        label="Net Profit"
        value={fmt(summary.totalNetProfit)}
        barClass={summary.totalNetProfit >= 0 ? 'metric-bar-success' : 'metric-bar-danger'}
        icon="↗"
        valueColor={profitColor}
      />
      <MetricCard
        label="Avg Margin"
        value={`${summary.avgMargin.toFixed(1)}%`}
        barClass={
          summary.avgMargin >= 20 ? 'metric-bar-success' :
          summary.avgMargin >= 10 ? 'metric-bar-warning' :
          'metric-bar-danger'
        }
        icon="%"
        valueColor={marginColor}
      />
      <MetricCard
        label="Best Platform"
        value={PLATFORMS[summary.bestPlatform]?.name || '—'}
        subtext="👑 Highest avg margin"
        barClass="metric-bar-warning"
        icon="★"
        valueColor="var(--accent-warning)"
      />
      <MetricCard
        label="Worst Platform"
        value={PLATFORMS[summary.worstPlatform]?.name || '—'}
        subtext="Lowest avg margin"
        barClass="metric-bar-muted"
        icon="▼"
        valueColor="var(--text-secondary)"
      />
    </div>
  );
}
