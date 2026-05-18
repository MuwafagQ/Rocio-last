import { db } from './firebase'; // Your Firestore instance
import { doc, setDoc } from 'firebase/firestore';

const storeDbInventory = [
  {
    id: '1',
    nameAr: 'مياه نوفا',
    nameEn: 'Nova Water',
    price: 18.50,
    imageUrl: 'https://cdn.salla.sa/AEdwj/890c20da-085a-464a-932d-20e363539958-500x500.png',
    brand: 'Nova',
    size: '330ml x 40',
    isSubscriptionAvailable: true,
    sodiumLevel: 17,
    phLevel: 7.4,
    rating: 4.8,
    reviews: 1240,
  },
  {
    id: '2',
    nameAr: 'مياه بيرين',
    nameEn: 'Berain Water',
    price: 17.00,
    imageUrl: 'https://cdn.salla.sa/AEdwj/890c20da-085a-464a-932d-20e363539958-500x500.png',
    brand: 'Berain',
    size: '330ml x 40',
    isSubscriptionAvailable: true,
    sodiumLevel: 15,
    phLevel: 7.2,
    rating: 4.7,
    reviews: 980,
  }
];

export async function runSeeding() {
  console.log("Starting Seeding...");
  
  for (const item of storeDbInventory) {
    // 1. Update/Add to Firestore (The Frontend Catalog)
    await setDoc(doc(db, 'products', item.id), {
      ...item
    });

    // 2. Add to Data Connect (The Backend Ledger)
    // Note: The schema currently has `Supplier`, `PurchaseOrder`, and `InventoryTransaction`.
    // Products themselves are stored in Firestore, and referenced by `productId` in Data Connect.
    // If you had a generated SDK, you would call it here to insert initial InventoryTransactions.
    console.log(`Seeded product ${item.nameEn} to Firestore.`);
  }
  
  console.log("Store DB Database is now Live!");
}