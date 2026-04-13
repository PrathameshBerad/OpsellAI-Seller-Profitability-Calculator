import { useState } from 'react';
import { PLATFORMS, SELLER_TIERS, SHIPPING_ZONES, EBAY_STORE_TIERS, ORDER_TYPES } from '../data/platforms';
import { CATEGORIES } from '../data/categories';

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
          onChange={e => onChange(type === 'number'
            ? (e.target.value === '' ? '' : Number(e.target.value))
            : e.target.value)}
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
        <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4, fontFamily: 'DM Sans' }}>
          ⚠ {warning}
        </p>
      )}
    </div>
  );
}

/* ── Select ─────────────────────────────────────────── */
function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field select-base"
        style={{ cursor: 'pointer' }}
      >
        <option value="">Select…</option>
        {options.map(opt => {
          const v = typeof opt === 'string' ? opt : opt.value;
          const l = typeof opt === 'string' ? opt : opt.label;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </div>
  );
}

/* ── Toggle segment ─────────────────────────────────── */
function ToggleField({ label, options, value, onChange }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="toggle-group">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`toggle-opt${value === opt ? ' active' : ''}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main ProductCard ───────────────────────────────── */
export default function ProductCard({ product, onUpdate, onUpdatePlatformSettings, onDuplicate, onDelete, canDelete }) {
  const [showSettings, setShowSettings] = useState(false);
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
          <ActionIconBtn
            onClick={onDuplicate}
            title="Duplicate"
            hoverColor="rgba(99,102,241,0.2)"
          >⧉</ActionIconBtn>
          {canDelete && (
            <ActionIconBtn
              onClick={onDelete}
              title="Delete"
              hoverColor="rgba(239,68,68,0.12)"
              hoverTextColor="#ef4444"
            >✕</ActionIconBtn>
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
            <p key={i} style={{ fontSize: 12, color: '#ef4444', fontFamily: 'DM Sans', fontWeight: 500 }}>
              ⚠ {w}
            </p>
          ))}
        </div>
      )}

      {/* Core inputs — 2×2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <InputField label="Selling Price" value={product.sellingPrice} onChange={v => onUpdate({ sellingPrice: v })} min={0} />
        <InputField label="COGS" value={product.cogs} onChange={v => onUpdate({ cogs: v })} min={0} />
        <InputField
          label="Weight"
          value={product.weight}
          onChange={v => onUpdate({ weight: v })}
          suffix="g" min={0}
          warning={product.weight === 0 && selectedPlatforms.some(p => PLATFORMS[p]?.hasWeight) ? 'Required for weight-based fees' : ''}
        />
        <InputField label="Ads Spend" value={product.adsSpend} onChange={v => onUpdate({ adsSpend: v })} min={0} />
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

      {/* Collapsible platform settings */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 0', background: 'transparent', border: 'none', cursor: 'pointer',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          transition: 'color 150ms ease',
        }}
      >
        <span style={{
          fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: showSettings ? 'var(--text-secondary)' : 'var(--text-muted)',
          fontFamily: 'DM Sans',
        }}>
          Platform Settings
        </span>
        <span style={{
          fontSize: 12, color: 'var(--text-muted)',
          transform: showSettings ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 250ms ease',
          display: 'inline-block',
        }}>▾</span>
      </button>

      {showSettings && (
        <div className="animate-open" style={{ overflow: 'hidden', paddingTop: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selectedPlatforms.map(platformId => {
              const platform = PLATFORMS[platformId];
              if (!platform) return null;
              const settings = product.platformSettings[platformId] || {};
              const cats = CATEGORIES[platformId] || [];
              const updateSetting = (updates) => onUpdatePlatformSettings(platformId, updates);

              return (
                <div key={platformId} style={{
                  padding: '12px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  {/* Platform label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: platform.color, flexShrink: 0,
                      boxShadow: `0 0 6px ${platform.color}60`,
                    }} />
                    <span style={{
                      fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                      fontFamily: 'DM Sans',
                    }}>{platform.name}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <SelectField
                      label="Category"
                      value={settings.category || ''}
                      onChange={v => updateSetting({ category: v })}
                      options={cats}
                    />
                    {platform.fbxProgram && (
                      <ToggleField
                        label="Fulfillment"
                        options={['Self-Ship', 'Platform Fulfillment']}
                        value={settings.fulfillmentMethod || 'Self-Ship'}
                        onChange={v => updateSetting({ fulfillmentMethod: v })}
                      />
                    )}
                    {platform.hasCOD && (
                      <ToggleField
                        label="Order Type"
                        options={ORDER_TYPES}
                        value={settings.orderType || 'Prepaid'}
                        onChange={v => updateSetting({ orderType: v })}
                      />
                    )}
                    {platform.hasSellerTier && (
                      <SelectField
                        label="Seller Tier"
                        value={settings.sellerTier || 'Gold'}
                        onChange={v => updateSetting({ sellerTier: v })}
                        options={SELLER_TIERS}
                      />
                    )}
                    {platform.hasShippingZone && (
                      <SelectField
                        label="Zone"
                        value={settings.shippingZone || 'Local'}
                        onChange={v => updateSetting({ shippingZone: v })}
                        options={SHIPPING_ZONES}
                      />
                    )}
                    {platform.hasStoreTier && (
                      <SelectField
                        label="Store Tier"
                        value={settings.ebayStoreTier || 'No Store'}
                        onChange={v => updateSetting({ ebayStoreTier: v })}
                        options={EBAY_STORE_TIERS}
                      />
                    )}
                    {platform.hasGST && (
                      <ToggleField
                        label="GST as Deduction"
                        options={['Yes', 'No']}
                        value={settings.includeGSTAsFee ? 'Yes' : 'No'}
                        onChange={v => updateSetting({ includeGSTAsFee: v === 'Yes' })}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Optional fields */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
              paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)',
            }}>
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
          </div>
        </div>
      )}
    </div>
  );
}

function ActionIconBtn({ onClick, title, children, hoverColor, hoverTextColor }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 28, height: 28, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hover ? (hoverColor || 'rgba(255,255,255,0.06)') : 'transparent',
        border: 'none', cursor: 'pointer',
        color: hover ? (hoverTextColor || 'var(--text-secondary)') : 'var(--text-muted)',
        fontSize: 13, transition: 'all 150ms ease',
      }}
    >
      {children}
    </button>
  );
}
