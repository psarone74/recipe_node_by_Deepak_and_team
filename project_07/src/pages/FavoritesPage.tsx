import React, { useState, useEffect } from 'react';
import { Heart, Compass } from 'lucide-react';
import { favoriteService } from '../services/favoriteService';
import { IRecipe } from '../services/recipeService';
import { RecipeCard } from '../components/common/RecipeCard';
import { useToast } from '../context/ToastContext';

interface FavoritesPageProps {
  onNavigate: (tab: string, recipeId?: string) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [recipes, setRecipes] = useState<IRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      try {
        setIsLoading(true);
        const res = await favoriteService.getFavorites();
        if (res?.data) {
          setRecipes(res.data);
        }
      } catch (e) {
        showToast('Error loading favorites', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadFavorites();
  }, []);

  const handleFavoriteChange = (recipeId: string, isFav: boolean) => {
    if (!isFav) {
      setRecipes((prev) => prev.filter((r) => r._id !== recipeId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-stone-200">
        <span className="text-xs font-bold uppercase tracking-wider text-[#a23e18] font-mono">
          Saved Cookbook
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#003629] tracking-tight mt-1">
          Favorite Recipes ({recipes.length})
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Your bookmarked culinary dishes across all cuisines and meal categories.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-2xl bg-white p-4 h-72 border border-stone-200 animate-pulse space-y-3">
              <div className="h-40 bg-stone-200 rounded-xl" />
              <div className="h-4 bg-stone-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              isFavoritedInitially={true}
              onFavoriteChange={handleFavoriteChange}
              onSelect={(id) => onNavigate('recipe-detail', id)}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-stone-200 space-y-3 max-w-md mx-auto">
          <Heart className="w-12 h-12 text-rose-300 mx-auto" />
          <h3 className="font-serif font-bold text-base text-stone-800">No favorites saved yet</h3>
          <p className="text-xs text-stone-500">
            Click the heart icon on any recipe card or detail page to bookmark it here for fast access.
          </p>
          <button
            onClick={() => onNavigate('explore')}
            className="px-5 py-2.5 rounded-xl bg-[#003629] text-white text-xs font-bold"
          >
            Explore Recipes
          </button>
        </div>
      )}

    </div>
  );
};
