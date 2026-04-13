import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Cell, ReferenceLine,
} from 'recharts';
import { PLATFORMS } from '../data/platforms';

/* ── Design tokens ──────────────────────────────── */
const PLATFORM_COLORS = Object.fromEntries(
  Object.entries(PLATFORMS).map(([id, p]) => [id, p.color])
);

const FEE_COLORS = ['#6366f1', '#ef4444', '#f97316', '#22d3ee', '#a855f7'];

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#1a1a2e',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    color: '#f1f5f9',
    fontSize: 12,
    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
    backdropFilter: 'blur(20px)',
    fontFamily: 'DM Sans, sans-serif',
  },
  itemStyle: { color: '#94a3b8' },
  labelStyle: { color: '#f1f5f9', fontWeight: 600, fontFamily: 'Sora, sans-serif' },
  cursor: { fill: 'rgba(255,255,255,0.03)' },
};

const axisProps = {
  tick: { fill: '#475569', fontSize: 11, fontFamily: 'DM Sans' },
  axisLine: { stroke: 'rgba(255,255,255,0.05)' },
  tickLine: false,
};

const gridProps = {
  strokeDasharray: '3 3',
  stroke: 'rgba(255,255,255,0.04)',
  vertical: false,
};

/* ── Chart card wrapper ─────────────────────────── */
function ChartCard({ title, subtitle, children }) {
  return (
    <div className="chart-card">
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Sans' }}>{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

/* ── 1. Profit Comparison ───────────────────────── */
function ProfitComparisonChart({ results }) {
  const data = useMemo(() => {
    const m = {};
    for (const r of results) {
      if (!m[r.productName]) m[r.productName] = { name: r.productName };
      m[r.productName][r.platform] = r.netProfit;
    }
    return Object.values(m);
  }, [results]);

  const platforms = useMemo(() => [...new Set(results.map(r => r.platform))], [results]);

  return (
    <ChartCard title="Profit by Platform" subtitle="Net profit comparison across all selected platforms">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8', fontFamily: 'DM Sans' }} />
          {platforms.map(p => (
            <Bar
              key={p}
              dataKey={p}
              name={PLATFORMS[p]?.name || p}
              fill={PLATFORM_COLORS[p] || '#6366f1'}
              radius={[6, 6, 0, 0]}
              opacity={0.88}
              animationBegin={0}
              animationDuration={900}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/* ── 2. Fee Breakdown Stacked ───────────────────── */
function FeeBreakdownStackedChart({ results }) {
  const data = useMemo(() => results.map(r => ({
    name: `${r.productName.substring(0, 9)}·${(PLATFORMS[r.platform]?.name || '').substring(0, 4)}`,
    Referral:   r.referralFee,
    Closing:    r.closingFee || 0,
    Shipping:   (r.shippingFee || 0) + (r.weightHandlingFee || 0) + (r.fulfillmentFee || 0),
    Collection: r.collectionFee || 0,
    Other:      (r.codFee || 0) + (r.tcs || 0) + (r.otherFees || 0),
  })), [results]);

  const feeTypes = ['Referral', 'Closing', 'Shipping', 'Collection', 'Other'];

  return (
    <ChartCard title="Fee Composition" subtitle="Stacked breakdown of platform fee types">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 4, bottom: 36 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="name" {...axisProps} angle={-20} textAnchor="end" interval={0} />
          <YAxis {...axisProps} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8', fontFamily: 'DM Sans' }} />
          {feeTypes.map((ft, i) => (
            <Bar
              key={ft}
              dataKey={ft}
              stackId="fees"
              fill={FEE_COLORS[i]}
              opacity={0.85}
              radius={i === feeTypes.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              animationBegin={0}
              animationDuration={900}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/* ── 3. Platform Radar ──────────────────────────── */
function PlatformRadarChart({ results }) {
  const platforms = useMemo(() => [...new Set(results.map(r => r.platform))], [results]);

  const data = useMemo(() => {
    if (platforms.length < 2) return [];
    const avgs = {};
    for (const pid of platforms) {
      const pr = results.filter(r => r.platform === pid);
      if (!pr.length) continue;
      avgs[pid] = {
        profit:  pr.reduce((s, r) => s + r.netProfit, 0)           / pr.length,
        margin:  pr.reduce((s, r) => s + r.profitMargin, 0)         / pr.length,
        roi:     pr.reduce((s, r) => s + r.roi, 0)                  / pr.length,
        fee:     pr.reduce((s, r) => s + r.effectiveFeePercent, 0)  / pr.length,
        settle:  PLATFORMS[pid]?.settlementDays || 7,
      };
    }
    const mx = {
      profit: Math.max(...Object.values(avgs).map(a => Math.abs(a.profit)), 1),
      margin: Math.max(...Object.values(avgs).map(a => Math.abs(a.margin)), 1),
      roi:    Math.max(...Object.values(avgs).map(a => Math.abs(a.roi)), 1),
      fee:    Math.max(...Object.values(avgs).map(a => a.fee), 1),
      settle: Math.max(...Object.values(avgs).map(a => a.settle), 1),
    };
    return [
      { metric: 'Profit',     ...Object.fromEntries(platforms.map(p => [p, Math.max(0, (avgs[p]?.profit / mx.profit) * 100)])) },
      { metric: 'Margin',     ...Object.fromEntries(platforms.map(p => [p, Math.max(0, (avgs[p]?.margin / mx.margin) * 100)])) },
      { metric: 'ROI',        ...Object.fromEntries(platforms.map(p => [p, Math.max(0, (avgs[p]?.roi    / mx.roi)    * 100)])) },
      { metric: 'Low Fees',   ...Object.fromEntries(platforms.map(p => [p, Math.max(0, (1 - avgs[p]?.fee / mx.fee)  * 100)])) },
      { metric: 'Settlement', ...Object.fromEntries(platforms.map(p => [p, Math.max(0, (1 - avgs[p]?.settle / mx.settle) * 100)])) },
    ];
  }, [results, platforms]);

  if (platforms.length < 2) {
    return (
      <ChartCard title="Platform Radar" subtitle="Multi-dimensional platform performance score">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: 13 }}>Select 2+ platforms to compare</p>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Platform Radar" subtitle="Relative performance across 5 axes — higher = better">
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#475569', fontSize: 11, fontFamily: 'DM Sans' }} />
          <PolarRadiusAxis tick={false} domain={[0, 100]} />
          {platforms.map(pid => (
            <Radar
              key={pid}
              name={PLATFORMS[pid]?.name || pid}
              dataKey={pid}
              stroke={PLATFORM_COLORS[pid]}
              fill={PLATFORM_COLORS[pid]}
              fillOpacity={0.1}
              strokeWidth={2}
              animationBegin={0}
              animationDuration={900}
            />
          ))}
          <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8', fontFamily: 'DM Sans' }} />
          <Tooltip {...tooltipStyle} />
        </RadarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/* ── 4. Waterfall Chart ─────────────────────────── */
function WaterfallChart({ results, products }) {
  const [selectedProductId, setSelectedProductId] = useState(null);
  const activeId = selectedProductId || products[0]?.id;
  const pr = results.filter(r => r.productId === activeId);

  const data = useMemo(() => {
    if (!pr.length) return [];
    const r = pr[0];
    return [
      { name: 'Price',    value: r.sellingPrice,                                                                              fill: '#6366f1' },
      { name: 'Referral', value: -r.referralFee,                                                                              fill: '#ef4444' },
      { name: 'Closing',  value: -(r.closingFee || 0),                                                                        fill: '#f59e0b' },
      { name: 'Shipping', value: -((r.shippingFee || 0) + (r.weightHandlingFee || 0) + (r.fulfillmentFee || 0)),              fill: '#f97316' },
      { name: 'Other',    value: -((r.collectionFee || 0) + (r.codFee || 0) + (r.tcs || 0) + (r.otherFees || 0)),            fill: '#a855f7' },
      { name: 'Payout',   value: r.netPayout,                                                                                 fill: '#22d3ee' },
      { name: 'COGS',     value: -(r.cogs || 0),                                                                              fill: '#475569' },
      { name: 'Profit',   value: r.netProfit,                                                                                 fill: r.netProfit >= 0 ? '#10b981' : '#ef4444' },
    ].filter(i => i.value !== 0 || ['Price', 'Payout', 'Profit'].includes(i.name));
  }, [pr]);

  return (
    <ChartCard title="Payout Waterfall" subtitle="Revenue flow from selling price to net profit">
      <div style={{ marginBottom: 16 }}>
        <select
          value={activeId || ''}
          onChange={e => setSelectedProductId(Number(e.target.value))}
          className="input-field select-base"
          style={{ width: 'auto', fontSize: 12, padding: '6px 28px 6px 10px' }}
        >
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip {...tooltipStyle} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} animationBegin={0} animationDuration={900}>
            {data.map((e, i) => <Cell key={i} fill={e.fill} opacity={0.88} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/* ── 5. Break-Even Line Chart ───────────────────── */
function BreakEvenChart({ results }) {
  const platforms = useMemo(() => [...new Set(results.map(r => r.platform))], [results]);

  const data = useMemo(() => {
    const pts = [];
    for (let u = 1; u <= 500; u += (u < 50 ? 1 : u < 200 ? 5 : 10)) {
      const pt = { units: u };
      for (const pid of platforms) {
        const pr = results.filter(r => r.platform === pid);
        if (!pr.length) continue;
        pt[pid] = (pr.reduce((s, r) => s + r.netProfit, 0) / pr.length) * u;
      }
      pts.push(pt);
    }
    return pts;
  }, [results, platforms]);

  return (
    <ChartCard title="Break-Even Analysis" subtitle="Cumulative profit curve by monthly units sold">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="units" {...axisProps} />
          <YAxis {...axisProps} />
          <ReferenceLine y={0} stroke="rgba(239,68,68,0.3)" strokeDasharray="4 4" label={{ value: 'Break-Even', fill: '#ef4444', fontSize: 10, fontFamily: 'DM Sans' }} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8', fontFamily: 'DM Sans' }} />
          {platforms.map(pid => (
            <Line
              key={pid}
              type="monotone"
              dataKey={pid}
              name={PLATFORMS[pid]?.name || pid}
              stroke={PLATFORM_COLORS[pid]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              animationBegin={0}
              animationDuration={1200}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/* ── Dashboard ──────────────────────────────────── */
export default function Dashboard({ results, products }) {
  if (results.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: 44, marginBottom: 16, opacity: 0.1 }}>◔</div>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: 14, marginBottom: 6 }}>
          No data yet
        </p>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: 12, opacity: 0.7 }}>
          Add products and select platforms to unlock analytics
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }} className="charts-grid">
        <style>{`
          @media (min-width: 1280px) { .charts-grid { grid-template-columns: 1fr 1fr; gap: 0; } }
        `}</style>
        <ProfitComparisonChart results={results} />
        <FeeBreakdownStackedChart results={results} />
      </div>
      <PlatformRadarChart results={results} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }} className="charts-grid">
        <WaterfallChart results={results} products={products} />
        <BreakEvenChart results={results} />
      </div>
    </div>
  );
}
