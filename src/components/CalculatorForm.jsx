import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { PLATFORMS, SELLER_TIERS, SHIPPING_ZONES, EBAY_STORE_TIERS, ORDER_TYPES } from '../data/platforms';
import { CATEGORIES } from '../data/categories';
import { IconGear, IconClose, IconAlert, IconHelp, IconPlus, IconMinus } from './Icon';

/* ── Reusable Input Components ── */
function Tip({ text }) {
  return (
    <span className="tooltip-wrap" style={{ marginLeft: 6 }}>
      <button
        type="button"
        aria-label={text}
        tabIndex={0}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 18, height: 18, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', border: 'none',
          color: 'var(--text-muted)', cursor: 'help', padding: 0,
        }}
      >
        <IconHelp size={12} />
      </button>
      <span className="tooltip-box">{text}</span>
    </span>
  );
}

function InputField({ label, value, onChange, type = 'number', tooltip, suffix, warning, className = '' }) {
  return (
    <div className={className}>
      <label className="field-label" style={{ display: 'flex', alignItems: 'center', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
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
              // We no longer clamp negative values here, we just pass them through to trigger the warning
              onChange(num);
            } else {
              onChange(e.target.value);
            }
          }}
          className={`input-field mono${warning ? ' warning' : ''}`}
          style={{ 
            ...(warning ? { borderColor: 'rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.02)' } : {}),
            padding: '12px 14px', fontSize: 18, background: 'rgba(255,255,255,0.02)'
          }}
          placeholder="0"
        />
        {suffix && (
          <span style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            fontSize: 14, color: 'var(--text-muted)', fontFamily: 'DM Sans',
            pointerEvents: 'none',
          }}>{suffix}</span>
        )}
      </div>
      {warning && (
        <p
          role="alert"
          style={{
            fontSize: 12, color: '#ef4444', marginTop: 8, fontFamily: 'DM Sans', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <IconAlert size={12} /> {warning}
        </p>
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="field-label" style={{ fontSize: 11, marginBottom: 4 }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field select-base"
        style={{ cursor: 'pointer', fontSize: 13, padding: '8px 28px 8px 12px', background: 'rgba(255,255,255,0.03)' }}
      >
        <option value="">Select…</option>
        {options.map((opt, i) => {
          const v = typeof opt === 'string' ? opt : opt.value;
          const l = typeof opt === 'string' ? opt : opt.label;
          return <option key={`${v}-${i}`} value={v}>{l}</option>;
        })}
      </select>
    </div>
  );
}

function ToggleField({ label, options, value, onChange }) {
  return (
    <div>
      <label className="field-label" style={{ fontSize: 11, marginBottom: 4 }}>{label}</label>
      <div className="toggle-group" style={{ background: 'rgba(255,255,255,0.03)' }}>
        {options.map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            onClick={() => onChange(opt)}
            className={`toggle-opt${value === opt ? ' active' : ''}`}
            style={{ padding: '8px 10px', fontSize: 11 }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Portalled Platform Settings Popover ────────────────────────
   Renders into document.body to escape every stacking-context /
   overflow:hidden ancestor. Position: fixed, anchored to the gear
   button's bounding rect. Viewport-edge aware, ESC + outside-click
   to close, focus management, ARIA. */
function PlatformSettingsPopover({
  id, platform, anchorRef, onClose,
  globalSettings, onUpdateSetting,
}) {
  const popoverRef = useRef(null);
  const [pos, setPos] = useState(null);

  const computePosition = useCallback(() => {
    const anchor = anchorRef?.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const W = 320;
    const margin = 16;
    // Horizontal: prefer left-align, flip to right-align if overflow
    let left = rect.left;
    if (left + W > window.innerWidth - margin) {
      left = Math.max(margin, rect.right - W);
    }
    // Vertical: prefer below, flip above if not enough room
    const popH = popoverRef.current?.offsetHeight ?? 360;
    let top = rect.bottom + 8;
    if (top + popH > window.innerHeight - margin) {
      top = Math.max(margin, rect.top - popH - 8);
    }
    setPos({ top, left });
  }, [anchorRef]);

  useLayoutEffect(() => {
    computePosition();
  }, [computePosition]);

  // Reposition on scroll / resize
  useEffect(() => {
    const onScroll = () => computePosition();
    const onResize = () => computePosition();
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onResize);
    };
  }, [computePosition]);

  // ESC + outside-click to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    const onMouseDown = (e) => {
      const popEl = popoverRef.current;
      const anchorEl = anchorRef?.current;
      if (!popEl) return;
      if (popEl.contains(e.target)) return;
      if (anchorEl && anchorEl.contains(e.target)) return;
      onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onMouseDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [onClose, anchorRef]);

  // Focus first field on open, restore to anchor on close
  useEffect(() => {
    const anchor = anchorRef?.current;
    const pop = popoverRef.current;
    if (!pop) return;
    const first = pop.querySelector('select, input, button');
    first?.focus();
    return () => { anchor?.focus?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="false"
      aria-label={`${platform.name} Settings`}
      className="animate-in"
      style={{
        position: 'fixed',
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        width: 320,
        zIndex: 1000,
        background: 'var(--bg-surface-3)',
        border: `1px solid ${platform.color}40`,
        boxShadow: `0 20px 48px rgba(0,0,0,0.55), 0 0 0 1px ${platform.color}18, 0 12px 32px ${platform.color}24`,
        borderRadius: 16,
        padding: '20px',
        visibility: pos ? 'visible' : 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontFamily: 'Sora', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
          {platform.name} Settings
        </p>
        <button
          onClick={onClose}
          aria-label="Close settings"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28,
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', borderRadius: 8, lineHeight: 1,
            transition: 'color 150ms ease, background 150ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <IconClose size={14} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SelectField
          label="Category"
          value={globalSettings[id]?.category || ''}
          onChange={v => onUpdateSetting(id, { category: v })}
          options={CATEGORIES[id] || []}
        />
        {platform.fbxProgram && (
          <ToggleField
            label="Fulfillment"
            options={['Self-Ship', 'Platform Fulfillment']}
            value={globalSettings[id]?.fulfillmentMethod || 'Self-Ship'}
            onChange={v => onUpdateSetting(id, { fulfillmentMethod: v })}
          />
        )}
        {platform.hasSellerTier && (
          <SelectField
            label="Tier"
            value={globalSettings[id]?.sellerTier || 'Gold'}
            onChange={v => onUpdateSetting(id, { sellerTier: v })}
            options={SELLER_TIERS}
          />
        )}
        {platform.hasShippingZone && (
          <SelectField
            label="Zone"
            value={globalSettings[id]?.shippingZone || 'Local'}
            onChange={v => onUpdateSetting(id, { shippingZone: v })}
            options={SHIPPING_ZONES}
          />
        )}
        {platform.hasCOD && (
          <ToggleField
            label="Order Type"
            options={ORDER_TYPES}
            value={globalSettings[id]?.orderType || 'Prepaid'}
            onChange={v => onUpdateSetting(id, { orderType: v })}
          />
        )}
      </div>
    </div>,
    document.body
  );
}

/* ── Main Form ── */
export default function CalculatorForm({ product, onUpdate, globalSettings, onUpdateSetting }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedConfig, setExpandedConfig] = useState(null);
  const gearRefs = useRef({});

  const { selectedPlatforms } = product;

  // Render warnings dynamically based on input values (not clamping)
  const warnings = [];
  if (product.sellingPrice > 0 && product.cogs > product.sellingPrice) {
    warnings.push('Selling below cost');
  }

  const togglePlatform = (platformId) => {
    const current = [...selectedPlatforms];
    const idx = current.indexOf(platformId);
    if (idx >= 0) {
      current.splice(idx, 1);
      if (expandedConfig === platformId) setExpandedConfig(null);
    } else {
      current.push(platformId);
    }
    onUpdate({ selectedPlatforms: current });
  };

  return (
    <div style={{
      background: 'var(--bg-surface-2)',
      border: '1px solid var(--glass-border)',
      borderRadius: '24px',
      padding: '40px 32px',
      marginBottom: '32px',
      boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Title */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Sora', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
          Calculate Profitability
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 6 }}>
          Enter your numbers below to instantly see the real margins across platforms.
        </p>
      </div>

      {warnings.length > 0 && (
        <div
          role="alert"
          className="animate-in"
          style={{
            marginBottom: 24, padding: '12px 16px',
            borderRadius: 12, background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center',
          }}
        >
          {warnings.map((w, i) => (
            <p
              key={i}
              style={{
                fontSize: 13, color: '#ef4444', fontFamily: 'DM Sans', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <IconAlert size={14} /> {w}
            </p>
          ))}
        </div>
      )}

      {/* Core Inputs (Always Visible) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: 24, 
        marginBottom: 20 
      }}>
        <InputField 
          label="Selling Price" 
          value={product.sellingPrice} 
          onChange={v => onUpdate({ sellingPrice: v })} 
          warning={product.sellingPrice < 0 ? 'Price cannot be negative' : ''}
        />
        <InputField 
          label="Cost of Goods (COGS)" 
          value={product.cogs} 
          onChange={v => onUpdate({ cogs: v })} 
          warning={product.cogs < 0 ? 'Cost cannot be negative' : ''}
        />
      </div>

      {/* Advanced Options Toggle */}
      <div style={{ textAlign: 'center', marginBottom: showAdvanced ? 24 : 32 }}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          aria-expanded={showAdvanced}
          aria-controls="advanced-options-panel"
          style={{
            background: 'transparent',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-secondary)',
            fontFamily: 'DM Sans',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 10,
            minHeight: 36,
            transition: 'all 150ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
        >
          {showAdvanced
            ? (<><IconMinus size={14} /> Hide Advanced Options</>)
            : (<><IconPlus  size={14} /> Show Advanced Options</>)}
        </button>
      </div>

      {/* Advanced Inputs */}
      {showAdvanced && (
        <div
          id="advanced-options-panel"
          className="animate-open"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
            marginBottom: 32,
            padding: '24px',
            background: 'rgba(255,255,255,0.015)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.03)'
          }}
        >
          <InputField
            label="Weight"
            value={product.weight}
            onChange={v => onUpdate({ weight: v })}
            suffix="g" 
            warning={product.weight < 0 ? 'Cannot be negative' : (product.weight === 0 && selectedPlatforms.some(p => PLATFORMS[p]?.hasWeight) ? 'Required for weight-based fees' : '')}
          />
          <InputField
            label="Return Rate"
            value={product.returnRate}
            onChange={v => onUpdate({ returnRate: v })}
            suffix="%"
            tooltip="Share of orders that come back. Enter 5 for 5%. Fashion typically runs 20-40%; electronics 2-5%."
            warning={
              product.returnRate < 0 ? 'Cannot be negative' :
              product.returnRate > 100 ? 'Cap at 100%' : ''
            }
          />
          <InputField
            label="Shipping to Buyer"
            value={product.shippingCostToBuyer}
            onChange={v => onUpdate({ shippingCostToBuyer: v })}
            warning={product.shippingCostToBuyer < 0 ? 'Cannot be negative' : ''}
            tooltip="Cost strictly charged to the buyer, if any."
          />
          <InputField 
            label="Ads Spend" 
            value={product.adsSpend} 
            onChange={v => onUpdate({ adsSpend: v })} 
            warning={product.adsSpend < 0 ? 'Cannot be negative' : ''}
          />
        </div>
      )}

      <hr style={{ borderTop: '1px solid var(--glass-border)', borderBottom: 'none', margin: '0 0 28px 0', opacity: 0.5 }} />

      {/* Platforms Selection Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Sora', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
            Compare Across Platforms
          </h3>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'DM Sans' }}>
            Toggle to include in calculations
          </span>
        </div>
        
        <div className="chip-row-scroll" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {Object.entries(PLATFORMS).map(([id, platform]) => {
            const active = selectedPlatforms.includes(id);
            const isExpanded = expandedConfig === id;
            return (
              <div key={id} style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                  <button
                    onClick={() => togglePlatform(id)}
                    className={`chip${active ? ' active' : ''}`}
                    style={{
                      padding: '10px 16px', fontSize: 14,
                      borderTopRightRadius: active ? 0 : 999,
                      borderBottomRightRadius: active ? 0 : 999,
                      ...(active ? {
                        borderColor: platform.color,
                        background: `${platform.color}15`,
                        color: platform.color,
                        borderRight: 'none',
                      } : {})
                    }}
                  >
                    {platform.name}
                  </button>
                  {/* Settings Gear for Active Platforms */}
                  {active && (
                    <button
                      ref={el => { if (el) gearRefs.current[id] = el; else delete gearRefs.current[id]; }}
                      onClick={() => setExpandedConfig(isExpanded ? null : id)}
                      aria-expanded={isExpanded}
                      aria-controls={`platform-settings-${id}`}
                      aria-haspopup="dialog"
                      aria-label={`${platform.name} settings`}
                      style={{
                        padding: '0 12px',
                        minWidth: 40,
                        background: isExpanded ? `${platform.color}25` : `${platform.color}15`,
                        border: `1px solid ${platform.color}`,
                        borderLeft: `1px solid ${platform.color}40`,
                        borderTopRightRadius: 999,
                        borderBottomRightRadius: 999,
                        color: platform.color,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 150ms'
                      }}
                      title={`${platform.name} settings`}
                    >
                      <IconGear size={14} />
                    </button>
                  )}
                </div>

                {/* Portalled Popover Settings (anchored to gear) */}
                {isExpanded && active && (
                  <PlatformSettingsPopover
                    id={id}
                    platform={platform}
                    anchorRef={{ current: gearRefs.current[id] }}
                    onClose={() => setExpandedConfig(null)}
                    globalSettings={globalSettings}
                    onUpdateSetting={onUpdateSetting}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
