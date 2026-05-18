import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
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
    
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (!active) return;
      const fetchedProducts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        } as Product;
      }).filter(p => p.nameAr && p.price !== undefined && p.size);
      setProducts(fetchedProducts);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products from Firestore:", error);
      if (active) setLoading(false);
    });

    return () => { 
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
