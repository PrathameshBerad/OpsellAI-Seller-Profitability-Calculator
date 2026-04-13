import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'opsell-products';

let nextId = 1;

function createProduct(overrides = {}) {
  const id = nextId++;
  return {
    id,
    name: overrides.name || `Product ${id}`,
    category: overrides.category || '',
    sellingPrice: overrides.sellingPrice ?? 999,
    cogs: overrides.cogs ?? 400,
    shippingCostToBuyer: overrides.shippingCostToBuyer ?? 0,
    weight: overrides.weight ?? 500,
    adsSpend: overrides.adsSpend ?? 0,
    returnRate: overrides.returnRate ?? 0,
    selectedPlatforms: overrides.selectedPlatforms || ['amazonIndia', 'flipkart', 'amazonUSA'],
    platformSettings: overrides.platformSettings || {
      amazonIndia: {
        fulfillmentMethod: 'Self-Ship',
        orderType: 'Prepaid',
        shippingZone: 'Local',
        includeGSTAsFee: false,
        category: 'Apparel – Men\'s T-Shirts',
      },
      amazonUSA: {
        fulfillmentMethod: 'Self-Ship',
        category: 'Apparel & Accessories',
      },
      flipkart: {
        fulfillmentMethod: 'Self-Ship',
        orderType: 'Prepaid',
        sellerTier: 'Gold',
        shippingZone: 'Local',
        includeGSTAsFee: false,
        category: 'T-Shirts',
      },
      shopsy: {
        fulfillmentMethod: 'Self-Ship',
        orderType: 'Prepaid',
        sellerTier: 'Gold',
        shippingZone: 'Local',
        includeGSTAsFee: false,
        category: 'Fashion',
      },
      noonUAE: {
        fulfillmentMethod: 'Platform Fulfillment',
        category: 'Apparel & Footwear',
      },
      walmart: {
        fulfillmentMethod: 'Self-Ship',
        category: 'Apparel & Accessories',
      },
      ebay: {
        ebayStoreTier: 'No Store',
        category: 'Most Categories',
      },
    },
  };
}

const DEFAULT_PRODUCTS = [
  createProduct({
    name: 'Blue Cotton T-Shirt',
    sellingPrice: 999,
    cogs: 350,
    weight: 250,
    selectedPlatforms: ['amazonIndia', 'flipkart', 'shopsy'],
    platformSettings: {
      amazonIndia: { fulfillmentMethod: 'Self-Ship', orderType: 'Prepaid', shippingZone: 'Local', includeGSTAsFee: false, category: 'Apparel – Men\'s T-Shirts' },
      amazonUSA: { fulfillmentMethod: 'Self-Ship', category: 'Apparel & Accessories' },
      flipkart: { fulfillmentMethod: 'Self-Ship', orderType: 'Prepaid', sellerTier: 'Gold', shippingZone: 'Local', includeGSTAsFee: false, category: 'T-Shirts' },
      shopsy: { fulfillmentMethod: 'Self-Ship', orderType: 'Prepaid', sellerTier: 'Gold', shippingZone: 'Local', includeGSTAsFee: false, category: 'Fashion' },
      noonUAE: { fulfillmentMethod: 'Platform Fulfillment', category: 'Apparel & Footwear' },
      walmart: { fulfillmentMethod: 'Self-Ship', category: 'Apparel & Accessories' },
      ebay: { ebayStoreTier: 'No Store', category: 'Most Categories' },
    },
  }),
  createProduct({
    name: 'Wireless Earbuds',
    sellingPrice: 2499,
    cogs: 900,
    weight: 150,
    selectedPlatforms: ['amazonIndia', 'amazonUSA', 'flipkart'],
    platformSettings: {
      amazonIndia: { fulfillmentMethod: 'Platform Fulfillment', orderType: 'Prepaid', shippingZone: 'National', includeGSTAsFee: false, category: 'Headsets, Headphones, Earphones' },
      amazonUSA: { fulfillmentMethod: 'Platform Fulfillment', category: 'Consumer Electronics' },
      flipkart: { fulfillmentMethod: 'Self-Ship', orderType: 'Prepaid', sellerTier: 'Silver', shippingZone: 'Zonal', includeGSTAsFee: false, category: 'Electronics Accessories' },
      shopsy: { fulfillmentMethod: 'Self-Ship', orderType: 'Prepaid', sellerTier: 'Gold', shippingZone: 'Local', includeGSTAsFee: false, category: 'Electronics' },
      noonUAE: { fulfillmentMethod: 'Platform Fulfillment', category: 'Headphones' },
      walmart: { fulfillmentMethod: 'Self-Ship', category: 'Consumer Electronics' },
      ebay: { ebayStoreTier: 'No Store', category: 'Most Categories' },
    },
  }),
];

function loadProducts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        nextId = Math.max(...parsed.map(p => p.id)) + 1;
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_PRODUCTS;
}

export function useProducts() {
  const [products, setProducts] = useState(loadProducts);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

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

  const updateProduct = useCallback((id, updates) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (typeof updates === 'function') return { ...p, ...updates(p) };
      return { ...p, ...updates };
    }));
  }, []);

  const updatePlatformSettings = useCallback((productId, platformId, settingUpdates) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return {
        ...p,
        platformSettings: {
          ...p.platformSettings,
          [platformId]: {
            ...p.platformSettings[platformId],
            ...settingUpdates,
          },
        },
      };
    }));
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    nextId = 1;
    setProducts([...DEFAULT_PRODUCTS.map((p, i) => ({ ...p, id: i + 1 }))]);
    nextId = DEFAULT_PRODUCTS.length + 1;
  }, []);

  return {
    products,
    addProduct,
    duplicateProduct,
    deleteProduct,
    updateProduct,
    updatePlatformSettings,
    resetAll,
  };
}
