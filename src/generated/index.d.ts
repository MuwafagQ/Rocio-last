import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Brand_Key {
  id: UUIDString;
  __typename?: 'Brand_Key';
}

export interface GetUserData {
  user?: {
    id: string;
    isCorporate: boolean;
    tier?: {
      id: UUIDString;
      name: string;
    } & Tier_Key;
      nameAr?: string | null;
      phone?: string | null;
  } & User_Key;
}

export interface GetUserVariables {
  id: string;
}

export interface ListBrandsData {
  brands: ({
    id: UUIDString;
    name: string;
    logoUrl?: string | null;
    isActive: boolean;
  } & Brand_Key)[];
}

export interface ListProductsData {
  products: ({
    id: UUIDString;
    nameAr: string;
    nameEn: string;
    descriptionAr?: string | null;
    imageUrl?: string | null;
    phLevel?: string | null;
    sodiumLevel?: string | null;
    isFeatured: boolean;
    isSubscription: boolean;
    isMosqueDonation: boolean;
    isLowSodium: boolean;
    isActive: boolean;
    brand: {
      id: UUIDString;
      name: string;
      logoUrl?: string | null;
    } & Brand_Key;
      skus_on_product: ({
        id: UUIDString;
        size: string;
        uom: string;
        stock: number;
        tierPrices_on_sku: ({
          price: number;
          tier: {
            name: string;
          };
        })[];
      } & Sku_Key)[];
  } & Product_Key)[];
}

export interface OrderItem_Key {
  id: UUIDString;
  __typename?: 'OrderItem_Key';
}

export interface Order_Key {
  id: UUIDString;
  __typename?: 'Order_Key';
}

export interface Product_Key {
  id: UUIDString;
  __typename?: 'Product_Key';
}

export interface Sku_Key {
  id: UUIDString;
  __typename?: 'Sku_Key';
}

export interface TierPrice_Key {
  skuId: UUIDString;
  tierId: UUIDString;
  __typename?: 'TierPrice_Key';
}

export interface Tier_Key {
  id: UUIDString;
  __typename?: 'Tier_Key';
}

export interface UpsertUserData {
  user_upsert: User_Key;
}

export interface UpsertUserVariables {
  id: string;
  nameAr?: string | null;
  phone?: string | null;
}

export interface User_Key {
  id: string;
  __typename?: 'User_Key';
}

interface UpsertUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
  operationName: string;
}
export const upsertUserRef: UpsertUserRef;

export function upsertUser(vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;
export function upsertUser(dc: DataConnect, vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface GetUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
  operationName: string;
}
export const getUserRef: GetUserRef;

export function getUser(vars: GetUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserData, GetUserVariables>;
export function getUser(dc: DataConnect, vars: GetUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserData, GetUserVariables>;

interface ListBrandsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListBrandsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListBrandsData, undefined>;
  operationName: string;
}
export const listBrandsRef: ListBrandsRef;

export function listBrands(options?: ExecuteQueryOptions): QueryPromise<ListBrandsData, undefined>;
export function listBrands(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListBrandsData, undefined>;

interface ListProductsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListProductsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListProductsData, undefined>;
  operationName: string;
}
export const listProductsRef: ListProductsRef;

export function listProducts(options?: ExecuteQueryOptions): QueryPromise<ListProductsData, undefined>;
export function listProducts(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListProductsData, undefined>;

