import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getApp } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listProducts } from '@firebasegen/rocio-mobile-sdk-connector';
import { useAuth } from './AuthContext';
import { Product } from '../types';

type TierName = 'standard' | 'subscriber' | 'corporate' | 'mosque';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const ProductContext = createContext<ProductContextType>({
  products: [],
  loading: true,
  error: null,
});

const BRAND_ID_MAP: Record<string, string> = {
  'Nova': 'nova',
  'Berain': 'berain',
  'Safa': 'safa',
  'OB': 'ob',
  'Rest': 'rest',
  'Tania': 'tania',
  'Zamzam': 'zamzam',
  'Arwa': 'arwa',
  'Aquafina': 'aquafina',
};

function parseInternalReference(ref: string): {
  unitVolume: string;
  packagingType: 'CRT' | 'PCS' | 'DUM';
  unitsPerPackage: number;
} {
  const match = ref.match(/^[A-Z]+-([0-9.]+(?:ML|L|ml|l))-([CDP])(\d+)?$/i);
  if (!match) {
    return { unitVolume: '', packagingType: 'PCS', unitsPerPackage: 1 };
  }
  const [, sizeStr, packCode, countStr] = match;
  const packTypeMap: Record<string, 'CRT' | 'PCS' | 'DUM'> = { C: 'CRT', P: 'PCS', D: 'DUM' };
  return {
    unitVolume: sizeStr.replace(/ml$/i, 'ml').replace(/(\d)l$/i, '$1L'),
    packagingType: packTypeMap[packCode.toUpperCase()] ?? 'PCS',
    unitsPerPackage: countStr ? parseInt(countStr, 10) : 1,
  };
}

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const dc = getDataConnect(getApp(), connectorConfig);
        const { data } = await listProducts(dc);
        if (active) {
          setRawData(data);
          setLoading(false);
        }
      } catch (e) {
        console.error('DataConnect listProducts failed:', e);
        if (active) {
          setError((e as Error).message);
          setLoading(false);
        }
      }
    })();
    return () => { active = false; };
  }, []);

  const tier: TierName = (user?.tier ?? 'standard') as TierName;

  const products = useMemo<Product[]>(() => {
    if (!rawData) return [];
    const flat: Product[] = [];
    for (const p of rawData.products ?? []) {
      for (const sku of p.skus_on_product) {
        const price =
          sku.tierPrices_on_sku.find((tp: any) => tp.tier.name.toLowerCase() === tier)?.price ??
          sku.tierPrices_on_sku.find((tp: any) => tp.tier.name.toLowerCase() === 'standard')?.price ??
          sku.tierPrices_on_sku[0]?.price ?? 0;
        const parsed = parseInternalReference(sku.internalReference ?? '');
        const brandId = BRAND_ID_MAP[p.brand.name] ?? p.brand.name.toLowerCase();
        flat.push({
          id: sku.id,
          nameAr: p.nameAr,
          nameEn: p.nameEn,
          price,
          imageUrl: p.imageUrl ?? '',
          brand: p.brand.name,
          brandId,
          packagingType: parsed.packagingType,
          unitVolume: parsed.unitVolume || sku.size,
          unitsPerPackage: parsed.unitsPerPackage,
          size: `${parsed.unitVolume || sku.size} x ${parsed.unitsPerPackage}`,
          internalReference: sku.internalReference ?? '',
          stock: sku.stock,
          isSubscriptionAvailable: p.isSubscription,
          sodiumLevel: p.sodiumLevel ? parseFloat(p.sodiumLevel) : 0,
          phLevel: p.phLevel ? parseFloat(p.phLevel) : 7,
          rating: 4.5,
          reviews: 0,
          isDonation: p.isMosqueDonation,
        });
      }
    }
    return flat;
  }, [rawData, tier]);

  return (
    <ProductContext.Provider value={{ products, loading, error }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
