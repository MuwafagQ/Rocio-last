import React, { createContext, useContext, useState, useEffect } from 'react';
import { listProducts } from '@firebasegen/rocio-mobile-sdk-connector';
import { Product } from '../types';

interface ProductContextType {
  products: Product[];
  loading: boolean;
}

const ProductContext = createContext<ProductContextType>({ products: [], loading: true });

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    listProducts().then(({ data }) => {
      if (!active) return;

      const mapped: Product[] = (data?.products ?? [])
        .filter(p => p.isActive)
        .flatMap(p =>
          p.skus_on_product
            .filter(sku => sku.isActive && sku.stock > 0)
            .map(sku => {
              const uomNum = parseInt(sku.uom.replace(/\D/g, ''), 10) || 1;
              const packagingType: 'CRT' | 'PCS' | 'DUM' =
                sku.uom.toUpperCase().startsWith('C') ? 'CRT' :
                sku.uom.toUpperCase() === 'PCS' ? 'PCS' : 'DUM';

              // Use Standard tier price; fall back to first available price
              const price =
                sku.tierPrices_on_sku.find(
                  tp => tp.tier.name.toLowerCase() === 'standard'
                )?.price ??
                sku.tierPrices_on_sku[0]?.price ??
                0;

              return {
                id: sku.id,
                nameAr: p.nameAr,
                nameEn: p.nameEn,
                price,
                imageUrl: p.imageUrl ?? '',
                brand: p.brand.name,
                brandId: p.brand.id,
                packagingType,
                unitVolume: sku.size,
                unitsPerPackage: uomNum,
                size: `${sku.size} x ${uomNum}`,
                internalReference: sku.internalReference,
                isSubscriptionAvailable: p.isSubscription,
                sodiumLevel: parseFloat(p.sodiumLevel ?? '0'),
                phLevel: parseFloat(p.phLevel ?? '7'),
                rating: 4.5,
                reviews: 0,
                isDonation: p.isMosqueDonation,
              } satisfies Product;
            })
        );

      setProducts(mapped);
      setLoading(false);
    }).catch(err => {
      console.error('DataConnect listProducts failed:', err);
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
