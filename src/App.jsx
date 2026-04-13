import { useState, useMemo, useEffect } from 'react';
import { useProducts } from './hooks/useProducts';
import { useCalculations } from './hooks/useCalculations';
import ProductList from './components/ProductList';
import SummaryStrip from './components/SummaryStrip';
import ComparisonTable from './components/ComparisonTable';
import FeeBreakdownCard from './components/FeeBreakdownCard';
import Dashboard from './components/Dashboard';

const TABS = [
  { id: 'overview',   label: 'Overview',    icon: '◎' },
  { id: 'breakdown',  label: 'Breakdowns',  icon: '≡' },
  { id: 'charts',     label: 'Analytics',   icon: '◔' },
];

function App() {
  const {
    products, addProduct, duplicateProduct, deleteProduct,
    updateProduct, updatePlatformSettings, resetAll,
  } = useProducts();

  const { results, summary } = useCalculations(products);
  const [activeTab, setActiveTab] = useState('overview');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const groupedResults = useMemo(() => {
    const map = {};
    for (const r of results) {
      if (!map[r.productId]) map[r.productId] = { name: r.productName, results: [] };
      map[r.productId].results.push(r);
    }
    return Object.values(map);
  }, [results]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', position: 'relative', overflowX: 'hidden' }}>

      {/* ── Ambient aura blobs ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-18%', left: '-12%',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 68%)',
          filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-18%', right: '-8%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.09) 0%, transparent 68%)',
          filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute', top: '42%', right: '22%',
          width: 420, height: 420, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 68%)',
          filter: 'blur(60px)',
        }} />
      </div>

      {/* ── Sticky Header ── */}
      <header
        className={scrolled ? 'header-shadow' : ''}
        style={{
          position: 'sticky', top: 0, zIndex: 50, width: '100%',
          height: 64,
          background: 'rgba(6,6,14,0.88)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid var(--glass-border)',
          transition: 'box-shadow 300ms ease',
        }}
      >
        <div style={{
          maxWidth: 1800, margin: '0 auto', height: '100%',
          padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
              flexShrink: 0,
            }}>
              <span style={{ color: 'white', fontSize: 16, lineHeight: 1 }}>◆</span>
            </div>
            <div>
              <div style={{
                fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 18,
                color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1,
              }}>
                OpsellAI
              </div>
              <div style={{
                fontSize: 11, color: 'var(--text-muted)',
                fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.04em', marginTop: 1,
              }}>
                Seller Profitability Calculator
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ResetButton onClick={resetAll} />
            <AddButton onClick={addProduct} disabled={products.length >= 10} />
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div style={{
        maxWidth: 1800, margin: '0 auto',
        display: 'flex', position: 'relative', zIndex: 1,
      }}>

        {/* ── Left Panel (desktop) ── */}
        <aside
          className="scrollbar-none stagger"
          style={{
            width: 420, flexShrink: 0,
            position: 'sticky', top: 64,
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
            background: 'var(--bg-surface-1)',
            borderRight: '1px solid var(--glass-border)',
            padding: '20px 18px',
            display: 'none',
          }}
          ref={el => { if (el) el.style.display = window.innerWidth >= 1024 ? 'block' : 'none'; }}
          id="left-panel"
        >
          <LeftPanelContent
            products={products}
            updateProduct={updateProduct}
            updatePlatformSettings={updatePlatformSettings}
            duplicateProduct={duplicateProduct}
            deleteProduct={deleteProduct}
            addProduct={addProduct}
          />
        </aside>

        {/* ── Right Panel ── */}
        <main style={{ flex: 1, minWidth: 0, padding: '28px 32px 48px' }}>

          {/* Mobile left panel */}
          <div
            style={{
              background: 'var(--bg-surface-1)',
              borderRadius: 16,
              border: '1px solid var(--glass-border)',
              padding: '16px',
              marginBottom: 24,
            }}
            className="lg-hidden"
            id="mobile-panel"
          >
            <LeftPanelContent
              products={products}
              updateProduct={updateProduct}
              updatePlatformSettings={updatePlatformSettings}
              duplicateProduct={duplicateProduct}
              deleteProduct={deleteProduct}
              addProduct={addProduct}
            />
          </div>

          <SummaryStrip summary={summary} />

          {/* Tab bar */}
          <div style={{ marginBottom: 24 }}>
            <div className="tab-bar">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span style={{ marginRight: 7, opacity: 0.75, fontSize: 13 }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div key={activeTab} className="animate-in">
            {activeTab === 'overview' && (
              <ComparisonTable results={results} />
            )}
            {activeTab === 'breakdown' && (
              groupedResults.length === 0
                ? <EmptyState icon="≡" message="Select platforms to see fee breakdowns" />
                : groupedResults.map(group => (
                    <FeeBreakdownCard key={group.name} productName={group.name} results={group.results} />
                  ))
            )}
            {activeTab === 'charts' && (
              <Dashboard results={results} products={products} />
            )}
          </div>
        </main>
      </div>

      {/* ── Responsive side-panel script ── */}
      <PanelVisibility />
    </div>
  );
}

/* Extracted so logic is reused for desktop + mobile */
function LeftPanelContent({ products, updateProduct, updatePlatformSettings, duplicateProduct, deleteProduct, addProduct }) {
  return (
    <ProductList
      products={products}
      onUpdate={updateProduct}
      onUpdatePlatformSettings={updatePlatformSettings}
      onDuplicate={duplicateProduct}
      onDelete={deleteProduct}
      onAdd={addProduct}
    />
  );
}

function ResetButton({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '8px 18px',
        borderRadius: 10,
        border: `1px solid ${hover ? 'rgba(239,68,68,0.35)' : 'var(--glass-border)'}`,
        background: hover ? 'rgba(239,68,68,0.06)' : 'transparent',
        color: hover ? '#ef4444' : 'var(--text-secondary)',
        fontFamily: 'DM Sans, sans-serif',
        fontWeight: 500,
        fontSize: 13,
        cursor: 'pointer',
        transition: 'all 200ms ease',
      }}
    >
      Reset
    </button>
  );
}

function AddButton({ onClick, disabled }) {
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setDown(false); }}
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      style={{
        padding: '8px 20px',
        borderRadius: 10,
        border: 'none',
        background: disabled ? 'rgba(255,255,255,0.06)' : 'var(--accent-primary)',
        color: disabled ? 'var(--text-muted)' : 'white',
        fontFamily: 'DM Sans, sans-serif',
        fontWeight: 600,
        fontSize: 13,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : hover ? '0 6px 20px rgba(99,102,241,0.5)' : '0 4px 12px rgba(99,102,241,0.35)',
        transform: down ? 'scale(0.96)' : 'scale(1)',
        filter: hover && !disabled ? 'brightness(1.08)' : 'none',
        transition: 'all 180ms ease',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      + Add Product
    </button>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div className="empty-state">
      <div style={{ fontSize: 42, marginBottom: 16, opacity: 0.12 }}>{icon}</div>
      <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
        {message}
      </p>
    </div>
  );
}

/* Handles desktop/mobile panel visibility via resize */
function PanelVisibility() {
  useEffect(() => {
    function update() {
      const lp = document.getElementById('left-panel');
      const mp = document.getElementById('mobile-panel');
      if (!lp || !mp) return;
      const desktop = window.innerWidth >= 1024;
      lp.style.display = desktop ? 'block' : 'none';
      mp.style.display = desktop ? 'none' : 'block';
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return null;
}

export default App;
