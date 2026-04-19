import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'opsell-products';
const SETTINGS_KEY = 'opsell-settings';
// Bump this when default shape changes — forces existing visitors to drop stale
// localStorage and re-hydrate with the new TOFU defaults (1 product, 1 platform).
// v2 = TOFU revamp (2026-04-19): single Amazon India default.
const SCHEMA_VERSION_KEY = 'opsell-schema-version';
const CURRENT_SCHEMA_VERSION = '2';

let nextId = 1;

export const DEFAULT_PLATFORM_SETTINGS = {
  amazonIndia: { fulfillmentMethod: 'Self-Ship', orderType: 'Prepaid', shippingZone: 'Local', includeGSTAsFee: false, category: 'Apparel – Men\'s T-Shirts' },
  amazonUSA: { fulfillmentMethod: 'Self-Ship', category: 'Apparel & Accessories' },
  flipkart: { fulfillmentMethod: 'Self-Ship', orderType: 'Prepaid', sellerTier: 'Gold', shippingZone: 'Local', includeGSTAsFee: false, category: 'T-Shirts' },
  shopsy: { fulfillmentMethod: 'Self-Ship', orderType: 'Prepaid', sellerTier: 'Gold', shippingZone: 'Local', includeGSTAsFee: false, category: 'Fashion' },
  noonUAE: { fulfillmentMethod: 'Platform Fulfillment', category: 'Apparel & Footwear' },
  walmart: { fulfillmentMethod: 'Self-Ship', category: 'Apparel & Accessories' },
  ebay: { ebayStoreTier: 'No Store', category: 'Most Categories' },
  meesho: { orderType: 'Prepaid', category: 'Women Ethnic' },
};

function createProduct(overrides = {}) {
  const id = nextId++;
  return {
    id,
    isSample: overrides.isSample || false,
    name: overrides.name || `Product ${id}`,
    category: overrides.category || '',
    sellingPrice: overrides.sellingPrice ?? 999,
    cogs: overrides.cogs ?? 400,
    shippingCostToBuyer: overrides.shippingCostToBuyer ?? 0,
    weight: overrides.weight ?? 500,
    adsSpend: overrides.adsSpend ?? 0,
    returnRate: overrides.returnRate ?? 0,
    // TOFU default: exactly one marketplace (Amazon India — highest AOV, most
    // common search intent). Users add more via chip toggles — progressive disclosure.
    selectedPlatforms: overrides.selectedPlatforms || ['amazonIndia'],
  };
}

// TOFU default: a single sample product, single platform. Multi-product comparison
// is an explicit upgrade the user requests via the "Add Another Product" CTA.
const DEFAULT_PRODUCTS = [
  createProduct({
    isSample: true,
    name: 'Blue Cotton T-Shirt',
    sellingPrice: 999,
    cogs: 350,
    weight: 250,
    selectedPlatforms: ['amazonIndia'],
    platformSettings: {
      amazonIndia: { fulfillmentMethod: 'Self-Ship', orderType: 'Prepaid', shippingZone: 'Local', includeGSTAsFee: false, category: 'Apparel – Men\'s T-Shirts' },
      amazonUSA: { fulfillmentMethod: 'Self-Ship', category: 'Apparel & Accessories' },
      flipkart: { fulfillmentMethod: 'Self-Ship', orderType: 'Prepaid', sellerTier: 'Gold', shippingZone: 'Local', includeGSTAsFee: false, category: 'T-Shirts' },
      shopsy: { fulfillmentMethod: 'Self-Ship', orderType: 'Prepaid', sellerTier: 'Gold', shippingZone: 'Local', includeGSTAsFee: false, category: 'Fashion' },
      noonUAE: { fulfillmentMethod: 'Platform Fulfillment', category: 'Apparel & Footwear' },
      walmart: { fulfillmentMethod: 'Self-Ship', category: 'Apparel & Accessories' },
      ebay: { ebayStoreTier: 'No Store', category: 'Most Categories' },
      meesho: { orderType: 'Prepaid', category: 'Women Ethnic' },
    },
  }),
];

function loadGlobalSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return DEFAULT_PLATFORM_SETTINGS;
}

const SLUG_MAP = {
  'amazon-india-seller-fees-calculator': 'amazonIndia',
  'flipkart-commission-calculator': 'flipkart',
  'meesho-commission-calculator': 'meesho',
  'shopsy-commission-calculator': 'shopsy',
  'amazon-usa-seller-fees-calculator': 'amazonUSA'
};

function getRoutePlatform() {
  if (typeof window !== 'undefined') {
    const slug = window.location.pathname.replace(/^\//, '');
    return SLUG_MAP[slug] || null;
  }
  return null;
}

/**
 * Parse shareable URL params: ?sp=999&cogs=350&ms=amazonIndia,flipkart,meesho
 * Returns a sparse override object, or null if no shareable params.
 */
function getShareParamOverrides() {
  if (typeof window === 'undefined') return null;
  const qs = new URLSearchParams(window.location.search);
  const sp = qs.get('sp');
  const cogs = qs.get('cogs');
  const ms = qs.get('ms');
  if (sp == null && cogs == null && ms == null) return null;
  const overrides = {};
  if (sp != null && !Number.isNaN(Number(sp))) overrides.sellingPrice = Number(sp);
  if (cogs != null && !Number.isNaN(Number(cogs))) overrides.cogs = Number(cogs);
  if (ms) {
    const platforms = ms.split(',').map(s => s.trim()).filter(Boolean);
    if (platforms.length) overrides.selectedPlatforms = platforms;
  }
  return Object.keys(overrides).length ? overrides : null;
}

function applyOverrides(product, overrides) {
  if (!overrides) return product;
  return { ...product, ...overrides };
}

function loadProducts() {
  const routePlatform = getRoutePlatform();
  const shareOverrides = getShareParamOverrides();

  // Schema migration: older visitors stored multi-platform defaults before the
  // TOFU revamp. Drop their cached state so they get the one-platform landing.
  try {
    const storedVersion = localStorage.getItem(SCHEMA_VERSION_KEY);
    if (storedVersion !== CURRENT_SCHEMA_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      localStorage.setItem(SCHEMA_VERSION_KEY, CURRENT_SCHEMA_VERSION);
    }
  } catch (e) { /* ignore — SSR / privacy modes */ }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (shareOverrides) {
          // Share-URL params take precedence over stored state for the first product
          parsed[0] = applyOverrides(parsed[0], shareOverrides);
        } else if (routePlatform) {
          // Force the first product to match the landing page intent
          parsed[0].selectedPlatforms = [routePlatform];
        }
        nextId = Math.max(...parsed.map(p => p.id)) + 1;
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }

  // If no saved state, apply landing page intent / share params to defaults
  const clonedDefaults = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
  if (shareOverrides) {
    clonedDefaults[0] = applyOverrides(clonedDefaults[0], shareOverrides);
  } else if (routePlatform) {
    clonedDefaults[0].selectedPlatforms = [routePlatform];
  }
  return clonedDefaults;
}

export function useProducts() {
  const [products, setProducts] = useState(loadProducts);
  const [globalSettings, setGlobalSettings] = useState(loadGlobalSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(globalSettings));
  }, [globalSettings]);

  const addProduct = useCallback(() => {
    if (products.length >= 10) return;
    setProducts(prev => [...prev, createProduct()]);
  }, [products.length]);

  const duplicateProduct = useCallback((id) => {
    if (products.length >= 10) return;
    setProducts(prev => {
      const source = prev.find(p => p.id === id);
      if (!source) return prev;
      const newId = nextId++;
      return [...prev, { ...JSON.parse(JSON.stringify(source)), id: newId, name: `${source.name} (Copy)` }];
    });
  }, [products.length]);

  const deleteProduct = useCallback((id) => {
    setProducts(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(p => p.id !== id);
    });
  }, []);

  const resetProduct = useCallback((id) => {
    setProducts(prev => {
      const source = prev.find(p => p.id === id);
      if (!source) return prev;
      const fresh = createProduct({ name: source.name });
      return prev.map(p => p.id === id ? { ...fresh, id } : p);
    });
  }, []);

  const updateProduct = useCallback((id, updates) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const applied = typeof updates === 'function' ? updates(p) : updates;
      // First user edit to a sample product flips it to "yours"
      const clearsSample = p.isSample && applied && !('isSample' in applied);
      return { ...p, ...applied, ...(clearsSample ? { isSample: false } : {}) };
    }));
  }, []);

  const clearSampleProduct = useCallback((id) => {
    setProducts(prev => prev.map(p => p.id === id ? {
      ...p, isSample: false, name: p.name.replace(/^Sample: /, ''),
      sellingPrice: 0, cogs: 0, weight: 0, adsSpend: 0,
      shippingCostToBuyer: 0, returnRate: 0,
    } : p));
  }, []);

  const loadSampleProduct = useCallback((id) => {
    setProducts(prev => prev.map(p => p.id === id ? {
      ...p, isSample: true, name: 'Blue Cotton T-Shirt',
      sellingPrice: 999, cogs: 350, weight: 250, adsSpend: 0,
      shippingCostToBuyer: 0, returnRate: 0,
      selectedPlatforms: ['amazonIndia'],
    } : p));
  }, []);

  const updateGlobalSetting = useCallback((platformId, settingUpdates) => {
    setGlobalSettings(prev => ({
      ...prev,
      [platformId]: {
        ...(prev[platformId] || {}),
        ...settingUpdates,
      },
    }));
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    nextId = 1;
    setProducts([...DEFAULT_PRODUCTS.map((p, i) => ({ ...p, id: i + 1 }))]);
    setGlobalSettings(DEFAULT_PLATFORM_SETTINGS);
    nextId = DEFAULT_PRODUCTS.length + 1;
  }, []);

  return {
    products,
    globalSettings,
    addProduct,
    duplicateProduct,
    deleteProduct,
    resetProduct,
    updateProduct,
    updateGlobalSetting,
    resetAll,
    clearSampleProduct,
    loadSampleProduct,
  };
}
