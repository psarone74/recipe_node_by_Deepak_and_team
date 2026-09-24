import React, { useState, useEffect } from 'react';
import { 
  Package2, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { pantryService, IPantryItem } from '../services/pantryService';
import { usePantry } from '../context/PantryContext';
import { useToast } from '../context/ToastContext';

interface PantryPageProps {
  onNavigate: (tab: string, recipeId?: string) => void;
}

export const PantryPage: React.FC<PantryPageProps> = ({ onNavigate }) => {
  const { pantryItems, refreshPantry } = usePantry();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal / Add item states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IPantryItem | null>(null);

  const [formData, setFormData] = useState({
    ingredient: '',
    quantity: '1',
    unit: 'pcs',
    category: 'Produce',
    expiryDate: '',
  });

  const categories = ['All', 'Produce', 'Dairy', 'Protein', 'Grains', 'Pantry', 'Spices'];

  const quickStaples = [
    { name: 'Eggs', quantity: 6, unit: 'pcs', category: 'Dairy' },
    { name: 'Potatoes', quantity: 3, unit: 'pcs', category: 'Produce' },
    { name: 'Onions', quantity: 2, unit: 'pcs', category: 'Produce' },
    { name: 'Tomatoes', quantity: 4, unit: 'pcs', category: 'Produce' },
    { name: 'Pasta', quantity: 1, unit: 'box', category: 'Grains' },
    { name: 'Garlic', quantity: 1, unit: 'head', category: 'Produce' },
    { name: 'Olive Oil', quantity: 1, unit: 'bottle', category: 'Pantry' },
    { name: 'Cheese', quantity: 1, unit: 'block', category: 'Dairy' },
  ];

  const filteredItems = pantryItems.filter((item) => {
    const matchesSearch = item.ingredient.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      ingredient: '',
      quantity: '1',
      unit: 'pcs',
      category: 'Produce',
      expiryDate: '',
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: IPantryItem) => {
    setEditingItem(item);
    setFormData({
      ingredient: item.ingredient,
      quantity: String(item.quantity),
      unit: item.unit,
      category: item.category || 'Produce',
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
    });
    setIsAddOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await pantryService.deleteItem(id);
      await refreshPantry();
      showToast('Pantry item removed', 'info');
    } catch (err: any) {
      showToast('Failed to delete pantry item', 'error');
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ingredient.trim()) {
      showToast('Please enter an ingredient name', 'error');
      return;
    }

    try {
      if (editingItem && editingItem._id) {
        await pantryService.updateItem(editingItem._id, formData);
        showToast('Pantry item updated', 'success');
      } else {
        await pantryService.addItem(formData);
        showToast(`Added ${formData.ingredient} to pantry`, 'success');
      }
      setIsAddOpen(false);
      await refreshPantry();
    } catch (e: any) {
      showToast('Failed to save item', 'error');
    }
  };

  const handleQuickAdd = async (staple: { name: string; quantity: number; unit: string; category: string }) => {
    try {
      await pantryService.quickAdd([staple]);
      await refreshPantry();
      showToast(`Quick-added ${staple.name} to pantry!`, 'success');
    } catch (e) {
      showToast('Failed to quick add', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#a23e18] font-mono">
            Inventory & Expiry Control
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#003629] tracking-tight mt-1">
            My Digital Pantry ({pantryItems.length})
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Keep track of what ingredients you have at home. This directly fuels the smart matching percentage engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('smart-match')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Cook From Pantry Now</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#003629] text-white text-xs font-bold hover:bg-[#1b4d3e] shadow-md shadow-[#003629]/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4 text-emerald-300" />
            <span>Add Ingredient</span>
          </button>
        </div>
      </div>

      {/* Quick Add Common Staples Bar */}
      <div className="p-4 rounded-2xl bg-[#f0f5f0] border border-[#003629]/15 space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#003629] font-mono flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#a23e18]" />
          1-Click Quick Add Common Staples
        </span>
        <div className="flex flex-wrap gap-2">
          {quickStaples.map((staple) => (
            <button
              key={staple.name}
              onClick={() => handleQuickAdd(staple)}
              className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:border-[#003629] hover:text-[#003629] hover:bg-emerald-50 transition-all shadow-2xs flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-emerald-600" />
              <span>{staple.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pantry ingredients (e.g. eggs, garlic, butter)..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-[#003629]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#003629] text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pantry Grid Cards */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const isExpiringSoon = item.expiryDate && 
              new Date(item.expiryDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;

            return (
              <div
                key={item._id}
                onClick={() => handleOpenEdit(item)}
                className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-[#003629]/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#a23e18] font-mono">
                      {item.category || 'Pantry'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(item);
                        }}
                        className="p-1 rounded text-stone-400 hover:text-stone-700"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(item._id || '', e)}
                        className="p-1 rounded text-stone-400 hover:text-rose-500"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-[#003629] transition-colors capitalize">
                    {item.ingredient}
                  </h3>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-[#003629] bg-[#003629]/10 px-2 py-0.5 rounded-md">
                      {item.quantity} {item.unit}
                    </span>

                    {item.expiryDate && (
                      <span
                        className={`text-[11px] flex items-center gap-1 font-semibold ${
                          isExpiringSoon ? 'text-amber-600' : 'text-stone-500'
                        }`}
                      >
                        {isExpiringSoon && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                        <span>Exp: {new Date(item.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <span>In Stock</span>
                  <span className="text-emerald-700 font-semibold group-hover:underline">
                    Find Recipes →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
          <Package2 className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-bold text-sm text-stone-800">No pantry items found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Add ingredients you regularly buy or click our quick-add staples above to test matching.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-[#003629] text-white text-xs font-bold"
          >
            Add New Ingredient
          </button>
        </div>
      )}

      {/* Add / Edit Item Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingItem ? 'Edit Pantry Item' : 'Add Item to Pantry'}
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Ingredient Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eggs, Potato, Garlic"
                  value={formData.ingredient}
                  onChange={(e) => setFormData({ ...formData, ingredient: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-[#003629]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Quantity</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. pcs, cups, lbs, oz"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-stone-900"
                  >
                    {categories.filter(c => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#003629] text-white font-bold hover:bg-[#1b4d3e]"
                >
                  {editingItem ? 'Save Changes' : 'Add to Pantry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
