import { useMemo, useState } from 'react';
import { PLATFORMS } from '../data/platforms';
import {
  IconSparkle, IconCheck, IconAlert, IconHelp,
} from './Icon';

/**
 * BeyondFeesDisclaimer
 *
 * Shown directly under the Platform Comparison table.
 *
 * Why it exists:
 *   Low-fee platforms (Meesho/Shopsy) almost always "win" on raw net-profit.
 *   For a novice TOFU seller, that's misleading — return rates, buyer intent,
 *   cash-flow, ads CPC, and brand-building differ wildly per marketplace.
 *   This component reframes the comparison honestly and creates a second
 *   lead-capture surface ("Talk to Opsell") for the scaling persona.
 *
 * Design notes (ui-ux-pro-max):
 *   - Uses type/space tokens; not ad-hoc px.
 *   - Progressive disclosure: contextual banner only when the winner is a
 *     known low-fee, high-return platform.
 *   - Factors list is scannable (icon + 1-line claim + 1-line implication).
 *   - Secondary CTA is calm (no urgency copy) — respects the primary "Send report" CTA.
 */

const LOW_FEE_HIGH_RETURN = new Set(['meesho', 'shopsy']);

const FACTORS = [
  {
    icon: 'buyers',
    label: 'Buyer intent & average order value',
    claim: 'Amazon and Flipkart Plus buyers pay 1.5-3x more for the same SKU.',
    implication:
      "A lower fee % on a ₹299 Meesho sale rarely beats a 15% cut of a ₹899 Amazon sale — price elasticity matters.",
  },
  {
    icon: 'returns',
    label: 'Real-world return rate',
    claim: 'Fashion on Meesho/Shopsy averages 25-40% returns; Amazon sits closer to 8-12%.',
    implication:
      'Returns double-bill you: reverse logistics + lost SKU. Model your platform-specific return rate, not a flat 5%.',
  },
  {
    icon: 'cashflow',
    label: 'Settlement speed & cash-flow',
    claim: 'Settlement cycles range from T+7 (Amazon) to T+15 (Meesho) to T+21 (COD-heavy SKUs).',
    implication:
      'Slow settlements choke reorder budgets. "More profit on paper" on a 15-day cycle can starve a fast-moving catalog.',
  },
  {
    icon: 'ads',
    label: 'Ads, CPC and discovery',
    claim: 'Amazon Ads can eat 10-18% of GMV in competitive categories; Meesho has no formal ads platform.',
    implication:
      "The calculator's Ads Spend field is your knob — but the realistic CPC per platform is what decides the ranking.",
  },
  {
    icon: 'brand',
    label: 'Brand equity & repeat customers',
    claim: 'Only Amazon (Brand Registry) and Flipkart (Brand Store) give you a moat beyond price.',
    implication:
      'A commodity seller on Meesho competes on ₹ every day. A branded seller on Amazon compounds organic rank.',
  },
  {
    icon: 'risk',
    label: 'Operational risk & account health',
    claim: 'Suspension rates, quality claims, SPF deductions, and GST disputes vary 3-5x by platform.',
    implication:
      'A single Amazon suspension or Meesho quality-deduction wave can reset a month of net profit to zero.',
  },
];

function FactorIcon({ kind }) {
  // Use a minimal color-coded dot + our existing icon set, per no-emoji rule.
  const color = {
    buyers:   'var(--accent-primary)',
    returns:  'var(--accent-danger)',
    cashflow: 'var(--accent-warning)',
    ads:      'var(--accent-secondary)',
    brand:    'var(--accent-success)',
    risk:     'var(--accent-danger)',
  }[kind] || 'var(--text-muted)';
  return (
    <span
      aria-hidden="true"
      style={{
        width: 30, height: 30, borderRadius: 8,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        color,
        flexShrink: 0,
      }}
    >
      <IconSparkle size={14} />
    </span>
  );
}

export default function BeyondFeesDisclaimer({ summary, onOpenLead }) {
  const [expanded, setExpanded] = useState(true);

  // Contextual banner copy: names the "winner" when it's a low-fee,
  // high-return-risk platform. This is the honest-broker moment.
  const contextBanner = useMemo(() => {
    if (!summary?.hasResults || summary.bestPlatform === '-') return null;
    // "Beyond-fees" makes sense only once the user compares 2+ marketplaces.
    // Single-platform users aren't in a comparison frame yet.
    if ((summary.uniquePlatformCount || 1) < 2) return null;
    const bestMeta = PLATFORMS[summary.bestPlatform];
    const name = bestMeta?.name || summary.bestPlatform;
    if (LOW_FEE_HIGH_RETURN.has(summary.bestPlatform)) {
      return {
        tone: 'warning',
        title: `${name} looks cheapest — but that's only half the story.`,
        body:
          `${name} wins on raw fees because commissions are flat and there's no ads auction. ` +
          `On a typical fashion SKU, returns can reach 25-40%, which flips a 60% paper margin into a 15-20% real margin. ` +
          `Weigh the factors below before concentrating volume here.`,
      };
    }
    return {
      tone: 'info',
      title: `${name} leads on per-unit profit — here's what fees don't show.`,
      body:
        'The comparison above ranks platforms by net payout. In practice, returns, buyer intent, ads, settlement speed, and account risk shift the real winner. Skim the six factors below.',
    };
  }, [summary]);

  if (!contextBanner) return null;

  const bannerStyles = contextBanner.tone === 'warning'
    ? {
        background: 'linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0.02) 100%)',
        border: '1px solid rgba(245,158,11,0.28)',
        color: 'var(--accent-warning)',
      }
    : {
        background: 'linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(99,102,241,0.04) 100%)',
        border: '1px solid rgba(34,211,238,0.22)',
        color: 'var(--accent-secondary)',
      };

  return (
    <div
      role="region"
      aria-label="Factors beyond platform fees"
      style={{ marginTop: 14, marginBottom: 32 }}
    >
      {/* Contextual banner */}
      <div
        className="animate-pop"
        style={{
          padding: '14px 18px', borderRadius: 14,
          display: 'flex', alignItems: 'flex-start', gap: 12,
          ...bannerStyles,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 30, height: 30, borderRadius: 8,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.04)',
            color: bannerStyles.color, flexShrink: 0, marginTop: 2,
          }}
        >
          <IconAlert size={15} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'Sora', fontWeight: 600, fontSize: 'var(--fs-body, 15px)',
            color: 'var(--text-primary)', letterSpacing: '-0.01em', marginBottom: 4,
          }}>
            {contextBanner.title}
          </p>
          <p style={{
            fontFamily: 'DM Sans', fontSize: 'var(--fs-label, 13px)',
            color: 'var(--text-secondary)', lineHeight: 1.55,
          }}>
            {contextBanner.body}
          </p>
        </div>
      </div>

      {/* Collapsible header */}
      <button
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        aria-controls="beyond-fees-body"
        style={{
          marginTop: 14,
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%', padding: '10px 14px',
          background: 'transparent',
          border: '1px solid var(--glass-border)',
          borderRadius: 12, cursor: 'pointer',
          color: 'var(--text-secondary)',
          fontFamily: 'DM Sans', fontSize: 'var(--fs-label, 13px)', fontWeight: 500,
          justifyContent: 'space-between',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <IconHelp size={14} />
          6 factors the fee comparison can&rsquo;t see
        </span>
        <span
          aria-hidden="true"
          style={{
            fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Sans',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}
        >
          {expanded ? 'Hide' : 'Show'}
        </span>
      </button>

      {expanded && (
        <div
          id="beyond-fees-body"
          className="animate-in"
          style={{
            marginTop: 12,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 10,
          }}
        >
          {FACTORS.map(f => (
            <article
              key={f.label}
              style={{
                padding: '14px', borderRadius: 12,
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}
            >
              <FactorIcon kind={f.icon} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: 'DM Sans', fontWeight: 600,
                  fontSize: 'var(--fs-label, 13px)',
                  color: 'var(--text-primary)', marginBottom: 4,
                }}>
                  {f.label}
                </p>
                <p style={{
                  fontFamily: 'DM Sans', fontSize: 12,
                  color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6,
                }}>
                  {f.claim}
                </p>
                <p style={{
                  fontFamily: 'DM Sans', fontSize: 12,
                  color: 'var(--text-muted)', lineHeight: 1.5,
                  paddingTop: 6,
                  borderTop: '1px dashed rgba(255,255,255,0.06)',
                }}>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                    So what:{' '}
                  </span>
                  {f.implication}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Secondary lead hook — scaling persona */}
      <div
        role="complementary"
        aria-label="Model these factors with Opsell"
        style={{
          marginTop: 18, padding: '16px 18px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(34,211,238,0.05) 100%)',
          border: '1px solid rgba(99,102,241,0.24)',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 40, height: 40, borderRadius: 12,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(99,102,241,0.16)',
            color: 'var(--accent-primary)', flexShrink: 0,
          }}
        >
          <IconSparkle size={20} />
        </span>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <p style={{
            fontFamily: 'Sora', fontWeight: 600,
            fontSize: 'var(--fs-body, 15px)',
            color: 'var(--text-primary)', letterSpacing: '-0.01em', marginBottom: 4,
          }}>
            Want the real ranking for <em>your</em> catalog?
          </p>
          <p style={{
            fontFamily: 'DM Sans',
            fontSize: 'var(--fs-label, 13px)',
            color: 'var(--text-muted)', lineHeight: 1.55,
          }}>
            Opsell pulls your actual returns, settlement, ads, and SPF deductions per SKU
            and ranks platforms the way your P&amp;L would. Free catalog audit for sellers doing
            50+ orders/day.
          </p>
        </div>
        <button
          onClick={onOpenLead}
          className="btn btn-primary"
          style={{
            flex: '0 0 auto', minHeight: 40, padding: '10px 18px',
            fontSize: 'var(--fs-label, 13px)',
          }}
        >
          <IconCheck size={14} /> Get a free catalog audit
        </button>
      </div>
    </div>
  );
}
