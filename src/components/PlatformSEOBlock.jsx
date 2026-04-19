import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEO_CONTENT = {
  'amazon-india-seller-fees-calculator': {
    title: "Amazon India Seller Fee Calculator 2026 | Profit Margin Tool",
    description: "Instantly calculate your true Amazon India net profit margin including referral, closing, and FBA/Easy Ship fees. Updated for 2026 rates.",
    h2: "Understanding Amazon India Seller Fees in 2026",
    content: "Selling on Amazon India requires a clear understanding of multiple fee layers. Every sale incurs a Referral Fee (percentage of item price based on category), a Fixed Closing Fee (scaled by price tiers), and a Shipping/Weight Handling Fee depending on whether you use FBA, Easy Ship, or Self-Ship. This commission calculator automates all of that math using real-time Amazon India rate cards.",
    changelog: "April 10, 2026: Amazon restructured weight limits for local fulfillment.",
    faq: [
      { q: "What is Amazon India's Referral Fee?", a: "The referral fee is a category-based percentage of your selling price, typically ranging from 2% to 17% depending on the product type." },
      { q: "Do I have to pay GST on Amazon seller fees?", a: "Yes, an 18% GST is applied on all Amazon fees (referral, closing, and shipping fees)." }
    ]
  },
  'flipkart-commission-calculator': {
    title: "Flipkart Commission Calculator 2026 | Real-time Margin & Profit Tool",
    description: "Instantly calculate your true Flipkart net profit margin including closing fees, fulfillment fees, and GST. Updated for Q2 2026 rates.",
    h2: "Calculating Your Flipkart Profit Margins",
    content: "Flipkart's fee structure consists of a Commission Fee, a Fixed Fee (based on price slabs), and a Collection Fee (differing between Prepaid and COD orders). Shipping fees run heavily dependent on product weight and your fulfillment seller tier (Gold, Silver, Bronze). Using our 2026 calculator guarantees you prevent invisible margin erosion on high-return volume exactly.",
    changelog: "March 15, 2026: Flipkart revised the fixed closing fee slabs for items under ₹300.",
    faq: [
      { q: "How is Flipkart shipping calculated?", a: "Flipkart shipping depends on the dead weight or volumetric weight (whichever is higher), the destination zone (Local, Zonal, National), and your seller tier." },
      { q: "What is the Collection Fee on Flipkart?", a: "The collection fee covers payment gateway costs. It's usually a flat value or small percentage, and it is higher for Cash on Delivery (COD) orders." }
    ]
  },
  'meesho-commission-calculator': {
    title: "Meesho 0% Commission Calculator 2026 | Check Net Payout",
    description: "Meesho charges 0% commission, but what is your true payout? Calculate shipping and return penalties instantly.",
    h2: "The Reality of Meesho's 0% Commission",
    content: "Unlike Amazon and Flipkart, Meesho famously charges 0% referral commission. However, suppliers must still account for 18% GST on shipping and potential return shipping penalties. Because the platform attracts highly price-sensitive shoppers, mastering your shipping costs per zone and pricing tightly is critical for profitability on Meesho.",
    changelog: "January 2026: Meesho enforced stricter return shipping penalties on non-quality returns.",
    faq: [
      { q: "Does Meesho really charge 0% commission?", a: "Yes, Meesho does not charge a referral fee or category commission. However, sellers still pay for shipping and advertising." },
      { q: "Who pays for returns on Meesho?", a: "If a customer returns an item due to a defect, the supplier generally bears the reverse forward shipping cost. This return rate directly impacts real margins." }
    ]
  }
};

export default function PlatformSEOBlock() {
  const location = useLocation();
  const slug = location.pathname.replace(/^\//, '');
  const data = SEO_CONTENT[slug];

  if (!data) return null;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": data.title,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "description": data.description,
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" }
      },
      {
        "@type": "FAQPage",
        "mainEntity": data.faq.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a }
        }))
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{data.title}</title>
        <meta name="description" content={data.description} />
        <link rel="canonical" href={`https://opsell.in/${slug}`} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="animate-in" style={{
        marginTop: 48, padding: '40px 32px',
        background: 'var(--bg-surface-2)', border: '1px solid var(--glass-border)',
        borderRadius: 24
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40 }}>
          
          {/* Editorial Content */}
          <div>
            <h2 style={{ fontFamily: 'Sora', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
              {data.h2}
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)', fontFamily: 'DM Sans', marginBottom: 24 }}>
              {data.content}
            </p>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, borderLeft: '4px solid var(--accent-primary)' }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Sans', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                Latest Update
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>
                {data.changelog}
              </p>
            </div>
          </div>

          {/* FAQ Block */}
          <div>
            <h3 style={{ fontFamily: 'Sora', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>
              Frequently Asked Questions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {data.faq.map((f, i) => (
                <div key={i} style={{ paddingBottom: 16, borderBottom: '1px solid var(--glass-border)' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Sora', marginBottom: 8 }}>
                    {f.q}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Sans', lineHeight: 1.5 }}>
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
