import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Package2, 
  SlidersHorizontal, 
  CheckCircle2, 
  XCircle, 
  ShoppingCart, 
  ArrowRight, 
  Filter, 
  ChefHat, 
  Clock, 
  Plus, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { matchingService, IMatchItem } from '../services/matchingService';
import { shoppingListService } from '../services/shoppingListService';
import { usePantry } from '../context/PantryContext';
import { useToast } from '../context/ToastContext';
import { RecipeCard } from '../components/common/RecipeCard';

interface SmartMatchPageProps {
  onNavigate: (tab: string, recipeId?: string) => void;
}

export const SmartMatchPage: React.FC<SmartMatchPageProps> = ({ onNavigate }) => {
  const { pantryItems, refreshPantry } = usePantry();
  const { showToast } = useToast();

  const [matches, setMatches] = useState<IMatchItem[]>([]);
  const [minMatch, setMinMatch] = useState<number>(50);
  const [sortBy, setSortBy] = useState<'highestMatch' | 'lowestMissing' | 'quickest'>('highestMatch');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [selectedDiet, setSelectedDiet] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipeForDetails, setSelectedRecipeForDetails] = useState<IMatchItem | null>(null);

  const cuisines = ['All', 'French', 'Italian', 'Asian', 'Mediterranean', 'Modern American', 'Indian'];
  const diets = ['All', 'Vegetarian', 'Vegan', 'Non-Vegetarian', 'Gluten-Free'];

  useEffect(() => {
    async function fetchMatches() {
      try {
        setIsLoading(true);
        const res = await matchingService.getMatches({
          minMatch,
          sortBy,
          cuisine: selectedCuisine,
          dietaryType: selectedDiet,
        });
        if (res?.matches) {
          setMatches(res.matches);
          if (res.matches.length > 0 && !selectedRecipeForDetails) {
            setSelectedRecipeForDetails(res.matches[0]);
          }
        }
      } catch (err: any) {
        showToast('Error calculating pantry matches', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchMatches();
  }, [minMatch, sortBy, selectedCuisine, selectedDiet, pantryItems]);

  const handleAddMissingToShopping = async (matchItem: IMatchItem) => {
    if (matchItem.missingIngredients.length === 0) {
      showToast('You already have all ingredients for this recipe!', 'info');
      return;
    }
    try {
      await shoppingListService.addMissingIngredients(
        matchItem.missingIngredients,
        matchItem.title
      );
      showToast(
        `Added ${matchItem.missingIngredients.length} missing ingredients to your shopping list!`,
        'success'
      );
    } catch (e: any) {
      showToast('Failed to add missing ingredients', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#a23e18]/10 text-[#a23e18] text-xs font-semibold tracking-wide font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Culinary Engine</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#003629] tracking-tight">
            Cook From My Pantry
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl leading-relaxed">
            Real-time percentage matching comparing your {pantryItems.length} active pantry ingredients against our tested recipe library.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('pantry')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-xs"
          >
            <Package2 className="w-4 h-4 text-[#003629]" />
            <span>Manage Pantry Items ({pantryItems.length})</span>
          </button>
        </div>
      </div>

      {/* Your Current Pantry Quick Bar */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono uppercase tracking-wider font-bold text-stone-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Your Current Pantry Ingredients ({pantryItems.length})
          </span>
          <button
            onClick={() => onNavigate('pantry')}
            className="text-[11px] font-semibold text-[#003629] hover:underline"
          >
            + Add / Edit Staples
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1 max-h-24 overflow-y-auto">
          {pantryItems.length > 0 ? (
            pantryItems.map((item) => (
              <span
                key={item._id}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#f0f5f0] text-[#003629] border border-[#003629]/20 flex items-center gap-1.5 shadow-2xs"
              >
                <span>✓</span>
                <span className="font-bold">{item.ingredient}</span>
                <span className="text-[10px] text-stone-500">({item.quantity} {item.unit})</span>
              </span>
            ))
          ) : (
            <div className="py-2 text-xs text-stone-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>No items in pantry yet. Click "Manage Pantry Items" to add essentials like eggs, potatoes, or garlic.</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Threshold Controls */}
      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-center text-xs">
        
        {/* Match Percentage Slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between font-semibold text-stone-700">
            <span>Minimum Match Threshold:</span>
            <span className="font-mono text-xs font-bold text-[#003629]">{minMatch}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={minMatch}
            onChange={(e) => setMinMatch(Number(e.target.value))}
            className="w-full accent-[#003629] cursor-pointer"
          />
        </div>

        {/* Sort by */}
        <div className="space-y-1">
          <span className="font-semibold text-stone-700 block">Sort Recommendations:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full p-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs focus:outline-none focus:border-[#003629]"
          >
            <option value="highestMatch">Highest Match % First</option>
            <option value="lowestMissing">Fewest Missing Ingredients</option>
            <option value="quickest">Quickest Total Time</option>
          </select>
        </div>

        {/* Cuisine Filter */}
        <div className="space-y-1">
          <span className="font-semibold text-stone-700 block">Cuisine:</span>
          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            className="w-full p-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs focus:outline-none focus:border-[#003629]"
          >
            {cuisines.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Dietary Filter */}
        <div className="space-y-1">
          <span className="font-semibold text-stone-700 block">Dietary Type:</span>
          <select
            value={selectedDiet}
            onChange={(e) => setSelectedDiet(e.target.value)}
            className="w-full p-2 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs focus:outline-none focus:border-[#003629]"
          >
            {diets.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Main Results Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span className="font-mono uppercase tracking-wider font-semibold">
            Found {matches.length} matching recipes
          </span>
          <span className="text-[11px]">
            {matches.filter((m) => m.matchPercentage >= 80).length} recipes with ≥ 80% match
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl bg-white p-4 h-72 border border-stone-200 animate-pulse space-y-3">
                <div className="h-40 bg-stone-200 rounded-xl" />
                <div className="h-4 bg-stone-200 rounded w-2/3" />
                <div className="h-3 bg-stone-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Cards List */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {matches.map((matchItem) => {
                const isSelected = selectedRecipeForDetails?.recipeId === matchItem.recipeId;

                return (
                  <div
                    key={matchItem.recipeId}
                    onClick={() => setSelectedRecipeForDetails(matchItem)}
                    className={`rounded-2xl transition-all cursor-pointer ${
                      isSelected ? 'ring-2 ring-[#003629] shadow-md' : ''
                    }`}
                  >
                    <RecipeCard
                      recipe={{
                        ...matchItem.recipe,
                        pantryMatch: {
                          percentage: matchItem.matchPercentage,
                          matched: matchItem.matchedIngredients,
                          missing: matchItem.missingIngredients,
                          totalIngredients: matchItem.totalIngredients,
                        },
                      }}
                      onSelect={(id) => onNavigate('recipe-detail', id)}
                    />
                  </div>
                );
              })}
            </div>

            {/* Right Pane: Selected Recipe Pantry Audit */}
            {selectedRecipeForDetails && (
              <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5 h-fit sticky top-24">
                <div className="border-b border-stone-100 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#a23e18] font-mono">
                      Pantry Match Audit
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#003629] text-white">
                      {selectedRecipeForDetails.matchPercentage}% Match
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug">
                    {selectedRecipeForDetails.title}
                  </h3>
                  <span className="text-xs text-stone-500">
                    {selectedRecipeForDetails.cuisine} • {selectedRecipeForDetails.cookTime + selectedRecipeForDetails.prepTime} mins
                  </span>
                </div>

                {/* Available in your pantry */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Available in Pantry ({selectedRecipeForDetails.matchedCount})
                  </span>
                  <div className="rounded-xl bg-emerald-50/60 p-3 space-y-1 text-xs text-emerald-950">
                    {selectedRecipeForDetails.matchedIngredients.length > 0 ? (
                      selectedRecipeForDetails.matchedIngredients.map((ing, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span>✓</span>
                          <span>{ing}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-stone-400 italic">None</span>
                    )}
                  </div>
                </div>

                {/* Missing Ingredients */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Missing to Purchase ({selectedRecipeForDetails.missingCount})
                  </span>
                  <div className="rounded-xl bg-rose-50/60 p-3 space-y-1.5 text-xs text-rose-950">
                    {selectedRecipeForDetails.missingIngredients.length > 0 ? (
                      selectedRecipeForDetails.missingIngredients.map((ing, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="font-medium">• {ing.name}</span>
                          <span className="text-stone-500 font-mono text-[11px]">{ing.quantity} {ing.unit}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-emerald-700 font-semibold">
                        🎉 All ingredients are available in your pantry!
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  {selectedRecipeForDetails.missingIngredients.length > 0 && (
                    <button
                      onClick={() => handleAddMissingToShopping(selectedRecipeForDetails)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#a23e18] text-white text-xs font-bold hover:bg-[#883313] transition-colors shadow-xs"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add Missing to Shopping List</span>
                    </button>
                  )}

                  <button
                    onClick={() => onNavigate('recipe-detail', selectedRecipeForDetails.recipeId)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#003629] text-white text-xs font-bold hover:bg-[#1b4d3e] transition-colors shadow-xs"
                  >
                    <span>Open Full Recipe & Cooking Mode</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            )}

          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-white border border-stone-200 text-center space-y-4 max-w-lg mx-auto">
            <Sparkles className="w-12 h-12 text-[#003629] mx-auto opacity-70" />
            <h3 className="font-serif text-xl font-bold text-stone-900">
              No matching recipes found at {minMatch}% threshold
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Try sliding the threshold down to 20% or 30%, or add more common ingredients (like olive oil, salt, eggs, onions, pasta) to your pantry.
            </p>
            <button
              onClick={() => setMinMatch(0)}
              className="px-5 py-2.5 rounded-xl bg-[#003629] text-white text-xs font-bold"
            >
              Show All Recipes
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
