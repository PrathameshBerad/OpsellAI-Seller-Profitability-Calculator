import { useState, useMemo, useEffect, useCallback } from 'react';
import { useProducts } from './hooks/useProducts';
import { useCalculations } from './hooks/useCalculations';
import CalculatorForm from './components/CalculatorForm';
import SummaryStrip from './components/SummaryStrip';
import ComparisonTable from './components/ComparisonTable';
import BeyondFeesDisclaimer from './components/BeyondFeesDisclaimer';
import FeeBreakdownCard from './components/FeeBreakdownCard';
import Dashboard from './components/Dashboard';
import PlatformSEOBlock from './components/PlatformSEOBlock';
import { PLATFORMS } from './data/platforms';
import {
  IconBrand, IconRefresh, IconPlus, IconTrash, IconMail, IconLink, IconCheck,
  IconSparkle, IconArrowDown,
} from './components/Icon';

function App() {
  const {
    products, addProduct, deleteProduct, updateProduct,
    updateGlobalSetting, globalSettings, resetAll,
    clearSampleProduct, loadSampleProduct,
  } = useProducts();

  // AI upsell dismissal (persisted so we never nag twice)
  const [aiTeaserDismissed, setAiTeaserDismissed] = useState(() => {
    try { return localStorage.getItem('opsell-ai-teaser-dismissed') === '1'; }
    catch { return false; }
  });
  const dismissAiTeaser = useCallback(() => {
    setAiTeaserDismissed(true);
    try { localStorage.setItem('opsell-ai-teaser-dismissed', '1'); } catch {}
  }, []);

  const [activeProductId, setActiveProductId] = useState(products[0]?.id);
  const activeProduct = products.find(p => p.id === activeProductId) || products[0];

  // Sync activeProductId if the selected product was deleted
  useEffect(() => {
    if (!products.find(p => p.id === activeProductId)) {
      setActiveProductId(products[0]?.id);
    }
  }, [products, activeProductId]);

  const { results, summary } = useCalculations(products, globalSettings);
  const [scrolled, setScrolled] = useState(false);

  // ── TOFU funnel state: email capture + share URL ──
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState(null); // null | 'ok' | 'bad'
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (!activeProduct) return '';
    const params = new URLSearchParams({
      sp: String(activeProduct.sellingPrice ?? ''),
      cogs: String(activeProduct.cogs ?? ''),
      ms: (activeProduct.selectedPlatforms || []).join(','),
    });
    const base = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://opsell.in/commcalc';
    return `${base}?${params.toString()}`;
  }, [activeProduct]);

  const handleEmailSubmit = useCallback(() => {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) {
      setEmailStatus('bad');
      return;
    }
    // Persist locally so we don't lose the lead if the API is unreachable.
    try {
      const leads = JSON.parse(localStorage.getItem('opsell-leads') || '[]');
      leads.push({ email: email.trim(), at: Date.now(), shareUrl });
      localStorage.setItem('opsell-leads', JSON.stringify(leads));
    } catch (e) { /* ignore */ }
    setEmailStatus('ok');
  }, [email, shareUrl]);

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

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

  const handleAddProduct = useCallback(() => {
    addProduct();
    setTimeout(() => {
      const formEl = document.getElementById('calculator-form');
      if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [addProduct]);

  // After addProduct, the new product will be at the end
  useEffect(() => {
    if (products.length > 1) {
      setActiveProductId(products[products.length - 1].id);
    }
  }, [products.length]); // only fires when count changes

  const isMultiProduct = products.length > 1;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', position: 'relative', overflowX: 'hidden' }}>

      {/* ── Ambient aura blobs ── */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-18%', left: '-12%',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 68%)',
          filter: 'blur(80px)',
          animation: 'aura-float 15s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-18%', right: '-8%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.09) 0%, transparent 68%)',
          filter: 'blur(80px)',
          animation: 'aura-float 20s ease-in-out infinite reverse',
        }} />
      </div>

      {/* ── Skip-to-content link (a11y) ── */}
      <a href="#calculator-form" className="sr-only" style={{
        position: 'absolute', top: 8, left: 8, padding: '8px 12px',
        background: 'var(--accent-primary)', color: '#fff', borderRadius: 8, zIndex: 100,
      }} onFocus={e => { e.currentTarget.classList.remove('sr-only'); }}
         onBlur={e => { e.currentTarget.classList.add('sr-only'); }}>
        Skip to calculator
      </a>

      {/* ── Sticky Header ── */}
      <header
        className={scrolled ? 'header-shadow' : ''}
        style={{
          position: 'sticky', top: 0, zIndex: 'var(--z-sticky, 50)', width: '100%',
          height: 64,
          background: 'rgba(6,6,14,0.88)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid var(--glass-border)',
          transition: 'box-shadow 300ms ease',
        }}
      >
        <div style={{
          maxWidth: 1200, margin: '0 auto', height: '100%',
          padding: '0 clamp(16px, 4vw, 24px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
              flexShrink: 0, color: '#fff',
            }}>
              <IconBrand size={18} />
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

          <ResetButton onClick={resetAll} />
        </div>
      </header>

      {/* ── Hero Band (TOFU value prop + trust) ── */}
      <section aria-label="Intro" className="hero-band" style={{
        position: 'relative', zIndex: 1,
        padding: 'clamp(32px, 6vw, 56px) clamp(16px, 4vw, 24px) clamp(20px, 4vw, 32px)',
        maxWidth: 1000, margin: '0 auto',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 12px', borderRadius: 999,
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.22)',
          color: 'var(--accent-success)',
          fontFamily: 'DM Sans', fontSize: 12, fontWeight: 600,
          letterSpacing: '0.02em', marginBottom: 16,
        }}>
          <IconCheck size={12} /> Free forever &middot; No signup &middot; Works in your browser
        </div>
        <h1 style={{
          fontFamily: 'Sora', fontWeight: 700,
          fontSize: 'clamp(28px, 5vw, 42px)',
          lineHeight: 1.1, letterSpacing: '-0.025em',
          color: 'var(--text-primary)',
          marginBottom: 12, maxWidth: 720,
        }}>
          See your real profit on 8 marketplaces &mdash; in under 10&nbsp;seconds.
        </h1>
        <p style={{
          fontFamily: 'DM Sans', fontSize: 'clamp(14px, 2vw, 17px)',
          color: 'var(--text-secondary)', lineHeight: 1.55,
          maxWidth: 640, marginBottom: 20,
        }}>
          Enter your selling price and cost. We&rsquo;ll show the real commission, shipping, GST, returns and net payout across Amazon, Flipkart, Meesho, Noon, Walmart, eBay, and more.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <a href="#calculator-form" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Enter your numbers
            <IconArrowDown size={13} />
          </a>
          <button
            onClick={() => activeProduct && loadSampleProduct(activeProduct.id)}
            className="btn btn-ghost"
            aria-label="Load sample product data"
          >
            <IconSparkle size={13} /> Try with sample product
          </button>
        </div>
        {/* Trust strip */}
        <div style={{
          marginTop: 24, display: 'flex', flexWrap: 'wrap',
          gap: '8px 20px', alignItems: 'center',
          fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-muted)',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-success)' }} />
            Your data never leaves this browser
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)' }} />
            Fees verified {typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : 'today'}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-secondary)' }} />
            Amazon &middot; Flipkart &middot; Meesho &middot; Noon &middot; Walmart &middot; eBay
          </span>
        </div>
      </section>

      {/* ── Main Single-Column Layout ── */}
      <main style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: 'clamp(8px, 2vw, 16px) clamp(16px, 4vw, 24px) 80px',
        position: 'relative', zIndex: 1,
      }}>

        {/* ── Product Tab Rail (only when multi-product) ── */}
        {isMultiProduct && (
          <div className="animate-in" style={{ marginBottom: 20 }}>
            <div
              role="tablist"
              aria-label="Products"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto',
                paddingBottom: 4,
              }}
              className="scrollbar-none"
            >
              {products.map(p => {
                const active = activeProduct.id === p.id;
                return (
                  <button
                    key={p.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveProductId(p.id)}
                    style={{
                      padding: '9px 18px', borderRadius: 10, flexShrink: 0, minHeight: 38,
                      background: active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)'}`,
                      color: active ? '#fff' : 'var(--text-secondary)',
                      fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                      cursor: 'pointer', transition: 'all 200ms ease',
                      maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}
                  >
                    {p.name}
                  </button>
                );
              })}
              {products.length < 10 && (
                <button
                  onClick={handleAddProduct}
                  aria-label="Add another product"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '9px 14px', borderRadius: 10, flexShrink: 0, minHeight: 38,
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px dashed rgba(99,102,241,0.25)',
                    color: 'var(--accent-primary)',
                    fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <IconPlus size={14} /> New
                </button>
              )}
              {products.length > 1 && (
                <button
                  onClick={() => {
                    if (window.confirm(`Remove "${activeProduct.name}"?`)) {
                      deleteProduct(activeProduct.id);
                    }
                  }}
                  aria-label={`Remove ${activeProduct.name}`}
                  className="btn btn-danger-ghost"
                  style={{ padding: '8px 14px', fontSize: 12, minHeight: 38 }}
                >
                  <IconTrash size={13} /> Remove
                </button>
              )}
            </div>
          </div>
        )}

        {/* Form Hero — wrapped in visually distinct input zone */}
        <div id="calculator-form" className="input-zone animate-in stagger" style={{
          position: 'relative',
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--glass-border)',
          borderLeft: '3px solid var(--accent-primary)',
          borderRadius: 20,
          padding: 'clamp(16px, 3vw, 24px)',
          marginBottom: 32,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 10, marginBottom: 14,
          }}>
            <div>
              <p style={{
                fontSize: 11, fontFamily: 'DM Sans', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: 'var(--accent-primary)', marginBottom: 4,
              }}>
                Step 1 &middot; Your product
              </p>
              <h2 style={{ fontFamily: 'Sora', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.015em' }}>
                Enter your numbers
              </h2>
            </div>
            {activeProduct?.isSample ? (
              <span
                title="These are sample numbers &mdash; edit any field to make them yours"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px', borderRadius: 999,
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  color: 'var(--accent-warning)',
                  fontFamily: 'DM Sans', fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.02em',
                }}
              >
                <IconSparkle size={11} /> Sample: Cotton T-shirt
                <button
                  onClick={() => clearSampleProduct(activeProduct.id)}
                  aria-label="Clear sample data"
                  style={{
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    color: 'var(--accent-warning)', marginLeft: 4, padding: 0,
                    fontFamily: 'DM Sans', fontSize: 11, fontWeight: 700,
                    textDecoration: 'underline', textUnderlineOffset: 2,
                  }}
                >
                  clear
                </button>
              </span>
            ) : (
              <button
                onClick={() => loadSampleProduct(activeProduct.id)}
                className="btn btn-ghost"
                style={{ fontSize: 12, padding: '6px 12px', minHeight: 32 }}
                aria-label="Load sample product"
              >
                <IconSparkle size={12} /> Load sample
              </button>
            )}
          </div>
          <CalculatorForm
            key={activeProduct.id}
            product={activeProduct}
            onUpdate={(updates) => updateProduct(activeProduct.id, updates)}
            globalSettings={globalSettings}
            onUpdateSetting={updateGlobalSetting}
          />
        </div>

        {results.length > 0 ? (
          <div className="animate-fade">
            {/* Primary takeaway — "You'd keep ₹X on {best platform}" */}
            {(() => {
              if (!summary?.hasResults || summary.bestPlatform === '-') return null;
              const bestResult = results
                .filter(r => r.platform === summary.bestPlatform)
                .sort((a, b) => b.netProfit - a.netProfit)[0];
              if (!bestResult) return null;
              const platformMeta = PLATFORMS[summary.bestPlatform] || {};
              const bestPlatformName = platformMeta.name || summary.bestPlatform;
              const sym = platformMeta.currencySymbol || '₹';
              const symPrefix = sym === 'AED' ? 'AED ' : sym;
              const profit = bestResult.netProfit;
              const margin = bestResult.profitMargin;
              const healthy = margin >= 10;
              return (
                <div
                  role="region"
                  aria-label="Your top result"
                  className="animate-pop"
                  style={{
                    marginBottom: 20, padding: '18px 22px',
                    background: healthy
                      ? 'linear-gradient(135deg, rgba(16,185,129,0.10) 0%, rgba(16,185,129,0.02) 100%)'
                      : 'linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0.02) 100%)',
                    border: `1px solid ${healthy ? 'rgba(16,185,129,0.24)' : 'rgba(245,158,11,0.28)'}`,
                    borderRadius: 16,
                  }}
                >
                  <p style={{
                    fontSize: 'var(--fs-caption, 11px)', fontFamily: 'DM Sans', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: 'var(--text-muted)', marginBottom: 6,
                  }}>
                    {(summary.uniquePlatformCount || 1) === 1 ? 'Your result' : 'Your top result'}
                  </p>
                  <h3 style={{
                    fontFamily: 'Sora', fontSize: 'clamp(20px, 3vw, 26px)',
                    fontWeight: 600, color: 'var(--text-primary)',
                    letterSpacing: '-0.015em', lineHeight: 1.25,
                  }}>
                    You&rsquo;d keep{' '}
                    <span style={{
                      color: healthy ? 'var(--accent-success)' : 'var(--accent-warning)',
                      fontFamily: 'DM Mono', fontVariantNumeric: 'tabular-nums',
                    }}>
                      {profit < 0 ? '-' : ''}{symPrefix}{Math.round(Math.abs(profit)).toLocaleString('en-IN')}
                    </span>
                    {' '}per unit on{' '}
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                      {bestPlatformName}
                    </span>
                    .
                  </h3>
                  <p style={{
                    fontSize: 'var(--fs-label, 13px)', color: 'var(--text-secondary)',
                    fontFamily: 'DM Sans', marginTop: 6,
                  }}>
                    That&rsquo;s a {margin.toFixed(1)}% margin.{' '}
                    {(summary.uniquePlatformCount || 1) === 1
                      ? 'Add another marketplace above to see how this compares.'
                      : 'Scroll for the full side-by-side breakdown, fee detail, and break-even chart.'}
                  </p>
                </div>
              );
            })()}

            {/* Summary Metrics */}
            <section aria-label="Summary metrics" style={{ marginBottom: 24 }}>
              <SummaryStrip summary={summary} />
            </section>

            {/* Inline AI Upsell (primary persona nudge, dismissible) */}
            {!aiTeaserDismissed && (
              <div
                role="complementary"
                aria-label="Opsell AI teaser"
                style={{
                  marginBottom: 32, padding: '14px 18px',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(34,211,238,0.05) 100%)',
                  border: '1px solid rgba(99,102,241,0.22)',
                  borderRadius: 14,
                  display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(99,102,241,0.16)',
                    color: 'var(--accent-primary)',
                    flexShrink: 0,
                  }}
                >
                  <IconSparkle size={18} />
                </span>
                <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                  <p style={{ fontFamily: 'Sora', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                    Forecast next month&rsquo;s margin across all your SKUs.
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Sans', marginTop: 2 }}>
                    Opsell AI syncs with your seller accounts and predicts profitability per SKU, per platform.
                  </p>
                </div>
                <a
                  href="https://opsell.in?utm_source=calculator&utm_medium=inline-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ flex: '0 0 auto', textDecoration: 'none', fontSize: 12, padding: '8px 14px', minHeight: 36 }}
                >
                  Try Opsell AI
                </a>
                <button
                  onClick={dismissAiTeaser}
                  aria-label="Dismiss AI teaser"
                  style={{
                    flex: '0 0 auto', width: 28, height: 28, borderRadius: 8,
                    border: 'none', background: 'transparent',
                    color: 'var(--text-muted)', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, lineHeight: 1,
                  }}
                  title="Dismiss"
                >
                  ×
                </button>
              </div>
            )}

            {/* Platform Comparison */}
            <section aria-label="Platform comparison" style={{ marginBottom: 24 }}>
              <SectionHeader
                title={
                  (summary?.uniquePlatformCount || 1) === 1
                    ? 'Your breakdown'
                    : 'Platform Comparison'
                }
                subtitle={
                  (summary?.uniquePlatformCount || 1) === 1
                    ? 'Toggle another marketplace above to compare side-by-side.'
                    : 'Side-by-side margins across every marketplace you selected'
                }
              />
              <ComparisonTable results={results} summary={summary} />
              {/* Single-platform nudge — upsell second comparison */}
              {(summary?.uniquePlatformCount || 1) === 1 && (
                <div
                  role="note"
                  style={{
                    marginTop: 12, padding: '12px 16px',
                    background: 'rgba(99,102,241,0.06)',
                    border: '1px dashed rgba(99,102,241,0.28)',
                    borderRadius: 12,
                    display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                    fontFamily: 'DM Sans', fontSize: 'var(--fs-label, 13px)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span aria-hidden="true" style={{
                    width: 26, height: 26, borderRadius: 8,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(99,102,241,0.12)', color: 'var(--accent-primary)',
                  }}>
                    <IconSparkle size={13} />
                  </span>
                  <span style={{ flex: 1, minWidth: 220 }}>
                    Curious how Flipkart, Meesho, or Noon would look?
                    Tap a second marketplace chip to see side-by-side margins.
                  </span>
                  <a
                    href="#calculator-form"
                    className="btn btn-ghost"
                    style={{ flex: '0 0 auto', fontSize: 12, padding: '6px 12px', minHeight: 32, textDecoration: 'none' }}
                  >
                    Pick marketplaces
                  </a>
                </div>
              )}
              <BeyondFeesDisclaimer
                summary={summary}
                onOpenLead={() => {
                  const el = document.getElementById('email-capture');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => el.focus(), 400);
                  }
                }}
              />
            </section>

            {/* Fee Breakdowns */}
            <section aria-label="Fee breakdowns" style={{ marginBottom: 40 }}>
              <SectionHeader
                title="Detailed Fee Breakdowns"
                subtitle="Line-by-line deductions per platform, including return impact"
              />
              {groupedResults.map(group => (
                <FeeBreakdownCard key={group.name} productName={group.name} results={group.results} />
              ))}
            </section>

            {/* Analytics Dashboard */}
            <section aria-label="Analytics" style={{ marginBottom: 48 }}>
              <SectionHeader
                title="Analytics & ROI"
                subtitle="Visualize where your margin lives"
              />
              <Dashboard results={results} products={products} />
            </section>

            {/* Platform SEO Content & Markup */}
            <PlatformSEOBlock />

            {/* TOFU Funnel Actions (Email & Share) */}
            <div className="animate-in" style={{
              marginTop: 32, marginBottom: 48, padding: 'clamp(20px, 4vw, 32px)',
              background: 'var(--bg-surface-1)', border: '1px solid var(--glass-border)',
              borderRadius: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32,
            }}>
              {/* ── Email capture ── */}
              <div>
                <h4 style={{
                  fontFamily: 'Sora', fontSize: 16, fontWeight: 600,
                  color: 'var(--text-primary)', marginBottom: 8,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <IconMail size={18} style={{ color: 'var(--accent-primary)' }} />
                  Get your full profitability report
                </h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'DM Sans', marginBottom: 16 }}>
                  PDF breakdown + monthly AI margin forecasts. No spam &mdash; unsubscribe any time.
                </p>
                {emailStatus === 'ok' ? (
                  <div
                    role="status"
                    aria-live="polite"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                      borderRadius: 10, background: 'rgba(16,185,129,0.08)',
                      border: '1px solid rgba(16,185,129,0.25)',
                      color: '#10b981', fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500,
                    }}
                  >
                    <IconCheck size={16} />
                    <span>Sent to {email}. Check your inbox in ~1 min.</span>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <label htmlFor="email-capture" className="sr-only">Email address</label>
                      <input
                        id="email-capture"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        placeholder="seller@brand.com"
                        value={email}
                        onChange={e => { setEmail(e.target.value); if (emailStatus === 'bad') setEmailStatus(null); }}
                        onKeyDown={e => { if (e.key === 'Enter') handleEmailSubmit(); }}
                        aria-invalid={emailStatus === 'bad'}
                        aria-describedby={emailStatus === 'bad' ? 'email-error' : undefined}
                        className="input-field"
                        style={{
                          flex: '1 1 200px',
                          borderColor: emailStatus === 'bad' ? 'rgba(239,68,68,0.5)' : undefined,
                        }}
                      />
                      <button
                        onClick={handleEmailSubmit}
                        className="btn btn-primary"
                        style={{ flex: '0 0 auto', minWidth: 96 }}
                      >
                        Send report
                      </button>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 8, fontFamily: 'DM Sans' }}>
                      We&rsquo;ll never share your email.
                    </p>
                    {emailStatus === 'bad' && (
                      <p
                        id="email-error"
                        role="alert"
                        style={{ fontSize: 12, color: '#ef4444', marginTop: 8, fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <IconSparkle size={12} /> Enter a valid email address
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* ── Share link ── */}
              <div>
                <h4 style={{
                  fontFamily: 'Sora', fontSize: 16, fontWeight: 600,
                  color: 'var(--text-primary)', marginBottom: 8,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <IconLink size={18} style={{ color: 'var(--accent-secondary)' }} />
                  Share these results
                </h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'DM Sans', marginBottom: 16 }}>
                  Copy a link to this exact calculation to share with your team.
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <label htmlFor="share-url" className="sr-only">Share URL</label>
                  <input
                    id="share-url"
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="input-field"
                    style={{ flex: '1 1 200px', color: 'var(--text-muted)' }}
                    onFocus={e => e.currentTarget.select()}
                  />
                  <button
                    onClick={handleCopy}
                    aria-live="polite"
                    className={copied ? 'btn' : 'btn btn-ghost'}
                    style={{
                      flex: '0 0 auto', minWidth: 110,
                      background: copied ? 'rgba(16,185,129,0.12)' : undefined,
                      color: copied ? '#10b981' : undefined,
                      borderColor: copied ? 'rgba(16,185,129,0.35)' : undefined,
                    }}
                  >
                    {copied
                      ? (<><IconCheck size={14} /> Copied</>)
                      : (<><IconLink size={14} /> Copy Link</>)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState message="Select platforms above to see profitability results" />
        )}

        {/* ── Subtle "Compare Another Product" CTA (only when single product) ── */}
        {!isMultiProduct && (
          <div style={{ textAlign: 'center', marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--glass-border)' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'DM Sans', marginBottom: 12 }}>
              Want to compare across multiple products?
            </p>
            <button
              onClick={handleAddProduct}
              className="btn"
              style={{
                background: 'transparent',
                border: '1px dashed rgba(99,102,241,0.3)',
                color: 'var(--accent-primary)',
                padding: '10px 20px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
              }}
            >
              <IconPlus size={14} /> Add Another Product
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{
        fontFamily: 'Sora', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)',
        letterSpacing: '-0.015em',
      }}>
        {title}
      </h3>
      {subtitle && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'DM Sans', marginTop: 4 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ResetButton({ onClick }) {
  return (
    <button
      onClick={() => {
        if (window.confirm("Clear all settings and start over?")) {
          onClick();
        }
      }}
      className="btn btn-danger-ghost"
      aria-label="Clear all settings"
    >
      <IconRefresh size={14} /> Clear All
    </button>
  );
}

function EmptyState({ message }) {
  return (
    <div className="empty-state animate-in" style={{ padding: '60px 20px', marginTop: 24 }}>
      <div style={{
        margin: '0 auto 16px', width: 56, height: 56, borderRadius: '50%',
        background: 'rgba(99,102,241,0.08)', border: '1px dashed rgba(99,102,241,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--accent-primary)',
      }}>
        <IconArrowDown size={24} />
      </div>
      <p style={{ color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontSize: 15, marginBottom: 6 }}>
        {message}
      </p>
      <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: 12 }}>
        Enter a selling price and COGS, then toggle one or more marketplaces above.
      </p>
    </div>
  );
}

export default App;
