import { useState } from 'react';
import { PLATFORMS, SELLER_TIERS, SHIPPING_ZONES, EBAY_STORE_TIERS, ORDER_TYPES } from '../data/platforms';
import { CATEGORIES } from '../data/categories';

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

export default function PlatformSettingsModal({ isOpen, onClose, globalSettings, onUpdateSetting }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(6, 6, 14, 0.85)',
      backdropFilter: 'blur(12px)',
    }}>
      <div className="animate-card" style={{
        background: 'var(--bg-surface-2)',
        border: '1px solid var(--glass-border)',
        borderRadius: 20, width: 800, maxWidth: '90vw',
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px', borderBottom: '1px solid var(--glass-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              Global Platform Defaults
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'DM Sans' }}>
              These shipping and category rules apply to all products automatically.
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', color: 'var(--text-muted)',
            fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', width: 40, height: 40, borderRadius: 12,
            transition: 'background 150ms',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >✕</button>
        </div>

        {/* Content */}
        <div className="scrollbar-none" style={{ padding: '0 32px 32px 32px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
            {Object.keys(PLATFORMS).map(platformId => {
              const platform = PLATFORMS[platformId];
              const settings = globalSettings[platformId] || {};
              const cats = CATEGORIES[platformId] || [];
              const updateSetting = (updates) => onUpdateSetting(platformId, updates);

              return (
                <div key={platformId} style={{
                  padding: '20px', borderRadius: 16,
                  background: 'var(--bg-surface-3)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  {/* Platform label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: platform.color, flexShrink: 0,
                      boxShadow: `0 0 10px ${platform.color}80`,
                    }} />
                    <span style={{
                      fontSize: 15, fontWeight: 600, color: 'var(--text-primary)',
                      fontFamily: 'Sora',
                    }}>{platform.name}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
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
          </div>
        </div>
      </div>
    </div>
  );
}
