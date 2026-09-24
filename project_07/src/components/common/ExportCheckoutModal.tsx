import React, { useState } from 'react';
import { X, Store, CheckCircle2, Truck, ShoppingBag, ArrowRight } from 'lucide-react';
import { IShoppingItem, shoppingListService } from '../../services/shoppingListService';
import { useToast } from '../../context/ToastContext';
import { usePantry } from '../../context/PantryContext';

interface ExportCheckoutModalProps {
  items: IShoppingItem[];
  onClose: () => void;
  onOrderPlaced: () => void;
}

export const ExportCheckoutModal: React.FC<ExportCheckoutModalProps> = ({
  items,
  onClose,
  onOrderPlaced,
}) => {
  const { showToast } = useToast();
  const { refreshPantry } = usePantry();
  const [selectedStore, setSelectedStore] = useState<'whole_foods' | 'amazon_fresh' | 'kroger'>('whole_foods');
  const [isProcessing, setIsProcessing] = useState(false);

  const stores = [
    {
      id: 'whole_foods' as const,
      name: 'Whole Foods Market',
      badge: 'Organic & Artisan Choice',
      deliveryTime: '2 hours',
      fee: '$4.99',
      matchRate: '100% Item Match',
    },
    {
      id: 'amazon_fresh' as const,
      name: 'Amazon Fresh',
      badge: 'Prime 1-Hour Window',
      deliveryTime: 'Today 5:00 PM',
      fee: 'FREE with Prime',
      matchRate: '95% Item Match',
    },
    {
      id: 'kroger' as const,
      name: 'Kroger Delivery',
      badge: 'Best Value Staples',
      deliveryTime: 'Today Evening',
      fee: '$3.50',
      matchRate: '92% Item Match',
    },
  ];

  const estimatedTotal = items.reduce((acc, curr) => acc + (curr.estimatedPrice || 2.50), 0);

  const handleCheckoutAndSync = async () => {
    try {
      setIsProcessing(true);
      // Auto stock all purchased items directly into MongoDB Pantry!
      await shoppingListService.autoStockToPantry(undefined, false);
      await refreshPantry();
      showToast('Order confirmed! Groceries transferred to pantry inventory.', 'success');
      onOrderPlaced();
    } catch (err: any) {
      showToast('Error syncing checkout items to pantry', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-stone-200 max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#003629] text-white flex items-center justify-center shadow-md shadow-[#003629]/20">
              <Store className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Partner Store Grocery Checkout
              </h3>
              <p className="text-xs text-stone-500">
                Seamless 1-Click order & instant MongoDB pantry synchronization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Store Selection */}
        <div className="p-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">
            Select Preferred Grocery Partner
          </h4>

          <div className="space-y-2.5">
            {stores.map((store) => (
              <div
                key={store.id}
                onClick={() => setSelectedStore(store.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  selectedStore === store.id
                    ? 'border-[#003629] bg-[#003629]/5'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedStore === store.id
                        ? 'border-[#003629] bg-[#003629]'
                        : 'border-stone-300'
                    }`}
                  >
                    {selectedStore === store.id && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900">{store.name}</span>
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {store.badge}
                      </span>
                    </div>
                    <span className="text-xs text-stone-500">
                      ETA: {store.deliveryTime} • Delivery: {store.fee}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-semibold text-[#003629]">
                  {store.matchRate}
                </span>
              </div>
            ))}
          </div>

          {/* Cart Manifest Preview */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
              <span className="font-mono uppercase tracking-wider font-semibold">
                Itemized Manifest ({items.length} items)
              </span>
              <span>Subtotal: ${estimatedTotal.toFixed(2)}</span>
            </div>

            <div className="max-h-36 overflow-y-auto rounded-xl border border-stone-100 bg-stone-50/70 p-3 space-y-1.5 text-xs text-stone-700">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="truncate max-w-[280px]">
                    • {item.ingredient} ({item.quantity} {item.unit})
                  </span>
                  <span className="font-mono text-stone-500">
                    ${(item.estimatedPrice || 2.50).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Instant Pantry Sync Guarantee Box */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3 text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Instant MongoDB Pantry Pipeline Sync:</span>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                Upon order placement, all items are automatically stocked into your digital pantry inventory, recalculating smart recipe matches in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 block">Total Estimated Cost</span>
            <span className="text-xl font-bold font-mono text-stone-900">
              ${(estimatedTotal + (selectedStore === 'whole_foods' ? 4.99 : selectedStore === 'kroger' ? 3.50 : 0)).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200/60 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={isProcessing || items.length === 0}
              onClick={handleCheckoutAndSync}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#003629] text-white hover:bg-[#1b4d3e] shadow-md shadow-[#003629]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Syncing with Store...</span>
              ) : (
                <>
                  <Truck className="w-4 h-4 text-emerald-300" />
                  <span>Confirm Order & Auto-Stock</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
