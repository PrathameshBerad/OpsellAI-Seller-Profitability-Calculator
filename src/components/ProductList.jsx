import ProductCard from './ProductCard';

export default function ProductList({ products, onUpdate, onUpdatePlatformSettings, onDuplicate, onDelete, onAdd }) {
  return (
    <div>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <p style={{
            fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'var(--text-muted)',
            fontFamily: 'DM Sans, sans-serif',
          }}>
            Products
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'DM Sans' }}>
            {products.length} / 10
          </p>
        </div>
        <button
          onClick={onAdd}
          disabled={products.length >= 10}
          style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.25)',
            color: 'var(--accent-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, lineHeight: 1, cursor: products.length >= 10 ? 'not-allowed' : 'pointer',
            opacity: products.length >= 10 ? 0.35 : 1,
            transition: 'all 200ms ease',
          }}
          onMouseEnter={e => { if (products.length < 10) e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
        >
          +
        </button>
      </div>

      {products.length >= 5 && products.length < 10 && (
        <div style={{
          marginBottom: 12,
          padding: '8px 12px',
          borderRadius: 10,
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.12)',
        }}>
          <p style={{ fontSize: 11, color: 'var(--accent-warning)', fontFamily: 'DM Sans', fontWeight: 500 }}>
            {products.length} products loaded — {10 - products.length} slot{10 - products.length !== 1 ? 's' : ''} remaining
          </p>
        </div>
      )}

      {/* Cards with stagger animation */}
      <div className="stagger">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onUpdate={(updates) => onUpdate(product.id, updates)}
            onUpdatePlatformSettings={(platformId, updates) => onUpdatePlatformSettings(product.id, platformId, updates)}
            onDuplicate={() => onDuplicate(product.id)}
            onDelete={() => onDelete(product.id)}
            canDelete={products.length > 1}
          />
        ))}
      </div>
    </div>
  );
}
