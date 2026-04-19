import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

export default function ProductList({ products, onUpdate, onDuplicate, onDelete, onReset, onAdd }) {
  const [activeId, setActiveId] = useState(products[0]?.id);

  // Sync active id if the selected product gets deleted
  useEffect(() => {
    if (!products.find(p => p.id === activeId)) {
      setActiveId(products[0]?.id);
    }
  }, [products, activeId]);

  const activeProduct = products.find(p => p.id === activeId) || products[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Section header & Tab Rail */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p style={{
              fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--text-muted)',
              fontFamily: 'DM Sans, sans-serif',
            }}>
              Product Profiles
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'DM Sans' }}>
              {products.length} / 10 Active
            </p>
          </div>
        </div>

        {/* Horizontal Tab Rail */}
        <div className="scrollbar-none" style={{
          display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8,
          borderBottom: '1px solid var(--glass-border)',
        }}>
          {products.map(p => (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              style={{
                padding: '8px 14px', borderRadius: 8, flexShrink: 0,
                background: activeId === p.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeId === p.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)'}`,
                color: activeId === p.id ? '#fff' : 'var(--text-secondary)',
                fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                cursor: 'pointer', transition: 'all 200ms ease',
                maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}
            >
              {p.name}
            </button>
          ))}
          <button
            onClick={() => {
              onAdd();
              // After adding, the list grows, we can't perfectly predict ID here without returning it, 
              // but it'll append to the end. The user can click it.
            }}
            disabled={products.length >= 10}
            style={{
              padding: '8px 14px', borderRadius: 8, flexShrink: 0,
              background: 'rgba(99,102,241,0.1)',
              border: '1px dashed rgba(99,102,241,0.3)',
              color: 'var(--accent-primary)',
              fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
              cursor: products.length >= 10 ? 'not-allowed' : 'pointer',
              opacity: products.length >= 10 ? 0.35 : 1,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            + New
          </button>
        </div>
      </div>

      {products.length >= 5 && products.length < 10 && (
        <div style={{
          marginBottom: 16,
          padding: '8px 12px',
          borderRadius: 10,
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.12)',
        }}>
          <p style={{ fontSize: 11, color: 'var(--accent-warning)', fontFamily: 'DM Sans', fontWeight: 500 }}>
            {10 - products.length} slot{10 - products.length !== 1 ? 's' : ''} remaining
          </p>
        </div>
      )}

      {/* Active Product Detail View */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="scrollbar-none animate-in">
        <ProductCard
          key={activeProduct.id}
          product={activeProduct}
          onUpdate={(updates) => onUpdate(activeProduct.id, updates)}
          onDelete={() => onDelete(activeProduct.id)}
          onReset={() => onReset(activeProduct.id)}
          canDelete={products.length > 1}
        />
      </div>
    </div>
  );
}
