
export interface ShippingConfig {
  base_fee_sar: number;
  free_distance_km: number;
  per_km_rate_sar: number;
  warehouse: { lat: number; lng: number; label: string };
  service_radius_km: number;
  urgency_multipliers: {
    urgent_now: number;
    same_day_within_5h: number;
    same_day_after_5h: number;
    next_day_or_later: number;
  };
  operating_hours: { start: string; end: string; timezone: string };
  urgent_now_enabled: boolean;
}

export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  imageUrl: string;
  brand: string;
  brandId: string; // e.g., 'nova', 'berain'
  packagingType: 'CRT' | 'PCS' | 'DUM'; // Carton, Pieces, Dummy/Other
  unitVolume: string; // e.g., '330ml', '5L'
  unitsPerPackage: number; // e.g., 40, 1
  size: string;
  internalReference: string; // Sku.internal_reference — used as product_id in /create-order webhook
  isSubscriptionAvailable: boolean;
  sodiumLevel: number; // mg/L
  phLevel: number;
  rating: number;
  reviews: number;
  isDonation?: boolean; // New flag for donation products
  stock?: number; // qty_available from Odoo via DataConnect; undefined = unknown, 0 = out of stock
}

export interface BrandInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  logoUrl: string;
  description: string;
  composition: {
    ph: number;
    sodium: number;
    calcium: number;
    magnesium: number;
    potassium: number;
    bicarbonate: number;
  };
}

export type SubscriptionFrequency = 'weekly' | 'biweekly' | 'monthly';

export interface CartItem extends Product {
  quantity: number;
  isSubscribed: boolean;
  subscriptionFrequency?: SubscriptionFrequency;
}

export interface TimeSlot {
  id: string;
  label: string;
  range: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role?: 'admin' | 'user';
  tier?: 'standard' | 'subscriber' | 'corporate' | 'mosque';
}

export enum StockPreference {
  CALL_ME = 'call_me',
  REPLACE = 'replace',
  CANCEL = 'cancel',
}

export enum Tab {
  HOME = 'home',
  BRANDS = 'brands',
  COMMUNITY = 'community',
  SUBSCRIPTIONS = 'subscriptions',
  CART = 'cart',
  PROFILE = 'profile',
  ERP = 'erp',
  SUPPORT = 'support',
  ORDERS = 'orders',
}
