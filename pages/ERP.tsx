import React, { useState } from 'react';
import { Database, Truck, ArrowUpRight, ArrowDownRight, Play, ArrowRight } from 'lucide-react';
import { runSeeding } from '../seedData';
// In a real deployed environment, you would import the generated SDK:
// import { listSuppliers } from '@firebasegen/erp-connector';
// import { dataConnect } from '../firebase';

/*
 * SYNC LOGIC: Firestore <-> PostgreSQL (Data Connect)
 * 
 * To link a Firestore Product to a PostgreSQL PurchaseOrder:
 * 1. The `productId` (document ID) from Firestore is stored as a standard String column in the PostgreSQL `PurchaseOrder` table.
 * 2. When displaying an order in the ERP, we query the `PurchaseOrder` from Data Connect to get the `productId`.
 * 3. We then fetch the corresponding product details (name, image, etc.) directly from Firestore using `getDoc(doc(db, 'products', productId))`.
 * 4. This hybrid approach keeps heavy relational data (orders, suppliers, inventory) in SQL while keeping the user-facing product catalog fast and offline-capable in NoSQL.
 */

export const ERP: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'inventory'>('suppliers');
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      await runSeeding();
      alert('تم إضافة المنتجات بنجاح إلى قاعدة البيانات!');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء إضافة المنتجات.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleBack = () => {
    window.location.href = '/';
  };

  return (
    <div className="pb-24">
      <div className="bg-primary text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={handleBack} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <ArrowRight size={24} />
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database size={24} />
            نظام تخطيط الموارد (ERP)
          </h1>
        </div>
        <div className="flex justify-between items-start mb-2">
          <p className="text-primary-foreground/80 text-sm">
            مدعوم بواسطة Firebase Data Connect (PostgreSQL)
          </p>
          <button 
            onClick={handleSeed}
            disabled={isSeeding}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            <Play size={14} />
            {isSeeding ? 'جاري الإضافة...' : 'إضافة المنتجات (Seed)'}
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex bg-white rounded-xl shadow-sm mb-6 p-1">
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'suppliers' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            الموردين
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'inventory' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            حركة المخزون
          </button>
        </div>

        {activeTab === 'suppliers' && (
          <div className="space-y-4">
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-4">
              ملاحظة: هذه البيانات سيتم جلبها من PostgreSQL عبر Data Connect.
              (يتطلب تشغيل firebase deploy للـ SDK)
            </div>
            {/* Mock Supplier Card */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-gray-900">مصنع مياه نقي</h3>
                  <p className="text-sm text-gray-500">contact@naqi.com</p>
                </div>
                <div className="bg-green-100 text-green-800 p-2 rounded-lg">
                  <Truck size={20} />
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <span>📍</span>
                الموقع: 24.7136° N, 46.6753° E (PostGIS)
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Mock Inventory Transaction */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 text-green-600 p-2 rounded-full">
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">توريد جديد</h3>
                  <p className="text-xs text-gray-500">منتج: مياه نوفا 330 مل</p>
                </div>
              </div>
              <div className="text-left">
                <span className="font-bold text-green-600">+500</span>
                <p className="text-xs text-gray-400">اليوم 10:30 ص</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 text-red-600 p-2 rounded-full">
                  <ArrowDownRight size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">صرف طلبية</h3>
                  <p className="text-xs text-gray-500">منتج: مياه نوفا 330 مل</p>
                </div>
              </div>
              <div className="text-left">
                <span className="font-bold text-red-600">-50</span>
                <p className="text-xs text-gray-400">أمس 04:15 م</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
