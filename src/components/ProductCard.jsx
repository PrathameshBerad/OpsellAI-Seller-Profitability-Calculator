import { useState } from 'react';
import { PLATFORMS, SELLER_TIERS, SHIPPING_ZONES, EBAY_STORE_TIERS, ORDER_TYPES } from '../data/platforms';
import { CATEGORIES } from '../data/categories';
import { IconRefresh, IconClose } from './Icon';

/* ── Tooltip ────────────────────────────────────────── */
function Tip({ text }) {
  return (
    <span className="tooltip-wrap" style={{ marginLeft: 4 }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 14, height: 14, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
        color: 'var(--text-muted)', fontSize: 9, fontWeight: 700,
        cursor: 'help', fontFamily: 'DM Sans',
      }}>?</span>
      <span className="tooltip-box">{text}</span>
    </span>
  );
}

/* ── Input ──────────────────────────────────────────── */
function InputField({ label, value, onChange, type = 'number', tooltip, suffix, warning, min }) {
  return (
    <div>
      <label className="field-label" style={{ display: 'flex', alignItems: 'center' }}>
        {label}
        {tooltip && <Tip text={tooltip} />}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={e => {
            if (type === 'number') {
              if (e.target.value === '') return onChange('');
              let num = Number(e.target.value);
              // Clamp values strictly to min limit so logic does not cascade negatives
              if (min !== undefined && num < min) num = min;
              onChange(num);
            } else {
              onChange(e.target.value);
            }
          }}
          min={min}
          className={`input-field mono${warning ? ' warning' : ''}`}
          style={warning ? { borderColor: 'rgba(239,68,68,0.4)' } : {}}
          placeholder="0"
        />
        {suffix && (
          <span style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Mono',
            pointerEvents: 'none',
          }}>{suffix}</span>
        )}
      </div>
      {warning && (
        <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4, fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span aria-hidden="true" style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} /> {warning}
        </p>
      )}
    </div>
  );
}

/* ── Main ProductCard ───────────────────────────────── */
export default function ProductCard({ product, onUpdate, onDelete, canDelete, onReset }) {
  const { selectedPlatforms } = product;

  const warnings = [];
  if (product.sellingPrice > 0 && product.cogs > product.sellingPrice) {
    warnings.push('Selling below cost');
  }

  const togglePlatform = (platformId) => {
    const current = [...selectedPlatforms];
    const idx = current.indexOf(platformId);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(platformId);
    onUpdate({ selectedPlatforms: current });
  };

  return (
    <div className="product-card">
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <input
          type="text"
          value={product.name}
          onChange={e => onUpdate({ name: e.target.value })}
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 15,
            color: 'var(--text-primary)', width: '100%',
            letterSpacing: '-0.01em',
          }}
          placeholder="Product Name"
        />
        <div className="card-actions" style={{ display: 'flex', gap: 4, marginLeft: 8, flexShrink: 0 }}>
          {onReset && (
            <ActionIconBtn
              onClick={onReset}
              label="Reset product config"
              hoverColor="rgba(245,158,11,0.12)"
              hoverTextColor="#f59e0b"
            ><IconRefresh size={15} /></ActionIconBtn>
          )}
          {canDelete && (
            <ActionIconBtn
              onClick={onDelete}
              label="Delete product"
              hoverColor="rgba(239,68,68,0.12)"
              hoverTextColor="#ef4444"
            ><IconClose size={15} /></ActionIconBtn>
          )}
        </div>
      </div>

      {/* Warning banner */}
      {warnings.length > 0 && (
        <div style={{
          marginBottom: 12, padding: '8px 12px',
          borderRadius: 10,
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.15)',
        }}>
          {warnings.map((w, i) => (
            <p key={i} style={{ fontSize: 12, color: '#ef4444', fontFamily: 'DM Sans', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }} role="alert">
              <span aria-hidden="true" style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} /> {w}
            </p>
          ))}
        </div>
      )}

      {/* Core inputs — 2×2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <InputField 
          label="Selling Price" 
          value={product.sellingPrice} 
          onChange={v => onUpdate({ sellingPrice: v })} 
          min={0} 
          warning={product.sellingPrice < 0 ? 'Must be ≥ 0' : ''} 
        />
        <InputField 
          label="COGS" 
          value={product.cogs} 
          onChange={v => onUpdate({ cogs: v })} 
          min={0} 
          warning={product.cogs < 0 ? 'Must be ≥ 0' : ''} 
        />
        <InputField
          label="Weight"
          value={product.weight}
          onChange={v => onUpdate({ weight: v })}
          suffix="g" min={0}
          warning={product.weight < 0 ? 'Must be ≥ 0' : (product.weight === 0 && selectedPlatforms.some(p => PLATFORMS[p]?.hasWeight) ? 'Required for weight-based fees' : '')}
        />
        <InputField 
          label="Ads Spend" 
          value={product.adsSpend} 
          onChange={v => onUpdate({ adsSpend: v })} 
          min={0} 
          warning={product.adsSpend < 0 ? 'Must be ≥ 0' : ''} 
        />
        <InputField
          label="Shipping to Buyer"
          value={product.shippingCostToBuyer}
          onChange={v => onUpdate({ shippingCostToBuyer: v })}
          min={0}
        />
        <InputField
          label="Return Rate"
          value={product.returnRate}
          onChange={v => onUpdate({ returnRate: v })}
          suffix="%" min={0}
        />
      </div>

      {/* Platform chips */}
      <div style={{ marginBottom: 14 }}>
        <p className="field-label">Platforms</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {Object.entries(PLATFORMS).map(([id, platform]) => {
            const active = selectedPlatforms.includes(id);
            return (
              <button
                key={id}
                onClick={() => togglePlatform(id)}
                className={`chip${active ? ' active' : ''}`}
                style={active ? {
                  borderColor: platform.color,
                  background: `${platform.color}18`,
                  color: platform.color,
                } : {}}
              >
                {platform.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ActionIconBtn({ onClick, label, title, children, hoverColor, hoverTextColor }) {
  const [hover, setHover] = useState(false);
  const accessibleLabel = label || title;
  return (
    <button
      onClick={onClick}
      type="button"
      aria-label={accessibleLabel}
      title={accessibleLabel}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        // 36×36 visual, 44×44 effective via inset pseudo not possible here
        // — push to 36 for better touch than 28. Outer card already has 8px gap.
        width: 36, height: 36, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hover ? (hoverColor || 'rgba(255,255,255,0.06)') : 'transparent',
        border: 'none', cursor: 'pointer',
        color: hover ? (hoverTextColor || 'var(--text-secondary)') : 'var(--text-muted)',
        transition: 'background 150ms ease, color 150ms ease',
      }}
    >
      {children}
    </button>
  );
}
