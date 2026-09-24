import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Store, 
  PackageCheck, 
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { shoppingListService, IShoppingItem } from '../services/shoppingListService';
import { ExportCheckoutModal } from '../components/common/ExportCheckoutModal';
import { usePantry } from '../context/PantryContext';
import { useToast } from '../context/ToastContext';

interface ShoppingListPageProps {
  onNavigate: (tab: string, recipeId?: string) => void;
}

export const ShoppingListPage: React.FC<ShoppingListPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const { refreshPantry } = usePantry();

  const [items, setItems] = useState<IShoppingItem[]>([]);
  const [groupedItems, setGroupedItems] = useState<Record<string, IShoppingItem[]>>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('pcs');
  const [newItemCategory, setNewItemCategory] = useState('Produce');
  const [newItemPrice, setNewItemPrice] = useState('2.50');

  useEffect(() => {
    loadShoppingList();
  }, []);

  const loadShoppingList = async () => {
    try {
      setIsLoading(true);
      const res = await shoppingListService.getShoppingList();
      if (res?.data) {
        setItems(res.data);
        if (res.grouped) {
          setGroupedItems(res.grouped);
        }
      }
    } catch (err: any) {
      showToast('Error loading shopping list', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await shoppingListService.toggleItem(id);
      if (res?.data) {
        setItems((prev) =>
          prev.map((item) => (item._id === id ? { ...item, checked: res.data.checked } : item))
        );
        // Refresh grouped
        loadShoppingList();
      }
    } catch (e) {
      showToast('Failed to toggle item', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await shoppingListService.deleteItem(id);
      setItems((prev) => prev.filter((item) => item._id !== id));
      loadShoppingList();
      showToast('Item deleted', 'info');
    } catch (e) {
      showToast('Failed to delete item', 'error');
    }
  };

  const handleClearCompleted = async () => {
    try {
      await shoppingListService.clearCompleted();
      showToast('Cleared completed grocery items', 'info');
      loadShoppingList();
    } catch (e) {
      showToast('Failed to clear completed items', 'error');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      await shoppingListService.addItem({
        ingredient: newItemName.trim(),
        quantity: newItemQty,
        unit: newItemUnit,
        category: newItemCategory,
        estimatedPrice: Number(newItemPrice) || 2.50,
      });
      setNewItemName('');
      showToast(`Added ${newItemName} to shopping list`, 'success');
      loadShoppingList();
    } catch (e) {
      showToast('Failed to add item', 'error');
    }
  };

  const handleAutoStock = async () => {
    try {
      const res = await shoppingListService.autoStockToPantry(undefined, true);
      await refreshPantry();
      showToast(`Auto-stocked ${res.stockedCount} items into your pantry!`, 'success');
      loadShoppingList();
    } catch (e) {
      showToast('Failed to auto stock items', 'error');
    }
  };

  const checkedCount = items.filter((i) => i.checked).length;
  const estimatedTotal = items.reduce((acc, curr) => acc + (curr.estimatedPrice || 2.50), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#a23e18] font-mono">
            Smart Grocery List
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#003629] tracking-tight mt-1">
            Shopping List ({items.length})
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Ingredients organized by supermarket aisle. Auto-stocks into your digital pantry when purchased.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {checkedCount > 0 && (
            <button
              onClick={handleAutoStock}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors shadow-xs"
              title="Transfers all checked items into your pantry inventory"
            >
              <PackageCheck className="w-4 h-4 text-emerald-300" />
              <span>Auto-Stock Checked ({checkedCount})</span>
            </button>
          )}

          <button
            disabled={items.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#003629] text-white text-xs font-bold hover:bg-[#1b4d3e] shadow-md shadow-[#003629]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
          >
            <Store className="w-4 h-4 text-emerald-300" />
            <span>Store Checkout (${estimatedTotal.toFixed(2)})</span>
          </button>
        </div>
      </div>

      {/* Quick Add Bar */}
      <form onSubmit={handleAddItem} className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
        <span className="text-[11px] font-bold text-stone-700 uppercase font-mono block">
          Add Custom Item to List
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
          <input
            type="text"
            required
            placeholder="Item name (e.g. Greek Yogurt)"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="sm:col-span-2 p-2 rounded-xl border border-stone-300 focus:outline-none focus:border-[#003629]"
          />
          <input
            type="text"
            placeholder="Qty (e.g. 2)"
            value={newItemQty}
            onChange={(e) => setNewItemQty(e.target.value)}
            className="p-2 rounded-xl border border-stone-300"
          />
          <input
            type="text"
            placeholder="Unit (e.g. tubs)"
            value={newItemUnit}
            onChange={(e) => setNewItemUnit(e.target.value)}
            className="p-2 rounded-xl border border-stone-300"
          />
          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value)}
            className="p-2 rounded-xl border border-stone-300 bg-white"
          >
            <option value="Produce">Produce</option>
            <option value="Dairy">Dairy</option>
            <option value="Meat">Meat</option>
            <option value="Bakery">Bakery</option>
            <option value="Pantry">Pantry</option>
            <option value="Spices">Spices</option>
          </select>
          <button
            type="submit"
            className="flex items-center justify-center gap-1 p-2 rounded-xl bg-[#003629] text-white font-bold hover:bg-[#1b4d3e] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Overview Stat Ribbon */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
        <div className="flex items-center gap-4">
          <span>Total Items: <strong className="text-stone-900">{items.length}</strong></span>
          <span>Checked: <strong className="text-emerald-700">{checkedCount}</strong></span>
          <span>Est. Cart: <strong className="text-stone-900 font-mono">${estimatedTotal.toFixed(2)}</strong></span>
        </div>

        {checkedCount > 0 && (
          <button
            onClick={handleClearCompleted}
            className="text-[11px] font-semibold text-rose-600 hover:underline"
          >
            Clear {checkedCount} Checked
          </button>
        )}
      </div>

      {/* Aisle-Grouped List */}
      {Object.keys(groupedItems).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([aisle, aisleItems]) => (
            <div key={aisle} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="px-5 py-3 bg-stone-50/80 border-b border-stone-100 flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-[#003629]">
                  {aisle} Aisle ({aisleItems.length})
                </span>
                <span className="text-[10px] uppercase font-mono text-stone-400 font-semibold">
                  Aisle Checklist
                </span>
              </div>

              <div className="divide-y divide-stone-100">
                {aisleItems.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleToggle(item._id || '')}
                    className={`flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50 transition-colors ${
                      item.checked ? 'bg-stone-50/60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(item._id || '');
                        }}
                        className="text-stone-400 hover:text-[#003629]"
                      >
                        {item.checked ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div>
                        <span
                          className={`text-xs font-bold block ${
                            item.checked ? 'line-through text-stone-400' : 'text-stone-900'
                          }`}
                        >
                          {item.ingredient}
                        </span>

                        <div className="flex items-center gap-2 text-[11px] text-stone-500">
                          <span>{item.quantity} {item.unit}</span>
                          {item.recipeOrigin && (
                            <>
                              <span>•</span>
                              <span className="text-[#a23e18] italic">For: {item.recipeOrigin}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-stone-500 font-semibold">
                        ${(item.estimatedPrice || 2.50).toFixed(2)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item._id || '');
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
          <ShoppingCart className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-serif font-bold text-base text-stone-800">Your shopping list is clear!</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            When you view recipes with missing pantry items, click "Add Missing Ingredients" to automatically populate this aisle checklist.
          </p>
        </div>
      )}

      {/* Export / Partner Checkout Modal (Screen 7 & 8) */}
      {isCheckoutOpen && (
        <ExportCheckoutModal
          items={items}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderPlaced={() => {
            setIsCheckoutOpen(false);
            onNavigate('delivery-tracking');
          }}
        />
      )}

    </div>
  );
};
