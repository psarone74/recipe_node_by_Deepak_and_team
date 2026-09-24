import React, { useState } from 'react';
import { Clock, Users, Heart, ChefHat, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';
import { IRecipe } from '../../services/recipeService';
import { favoriteService } from '../../services/favoriteService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface RecipeCardProps {
  recipe: IRecipe;
  onSelect: (recipeId: string) => void;
  isFavoritedInitially?: boolean;
  onFavoriteChange?: (recipeId: string, isFav: boolean) => void;
  highlightMatch?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSelect,
  isFavoritedInitially = false,
  onFavoriteChange,
  highlightMatch = true,
}) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [isFavorited, setIsFavorited] = useState(isFavoritedInitially);
  const [imgError, setImgError] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Please sign in to save recipes to your favorites.', 'info');
      return;
    }
    try {
      const res = await favoriteService.toggleFavorite(recipe._id || '');
      setIsFavorited(res.isFavorited);
      showToast(res.message, 'success');
      if (onFavoriteChange && recipe._id) {
        onFavoriteChange(recipe._id, res.isFavorited);
      }
    } catch (err: any) {
      showToast('Error updating favorite', 'error');
    }
  };

  const match = recipe.pantryMatch;
  const matchPct = match?.percentage ?? 0;
  const missingCount = match?.missing?.length ?? 0;

  return (
    <div
      onClick={() => recipe._id && onSelect(recipe._id)}
      className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#003629]/30 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Recipe Image with Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <img
          src={
            imgError || !recipe.image
              ? 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&auto=format&fit=crop'
              : recipe.image
          }
          alt={recipe.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient backdrop for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

        {/* Top bar: Cuisine pill & Favorite heart */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-[#003629] shadow-sm pointer-events-auto">
            {recipe.cuisine || 'International'}
          </span>

          <button
            onClick={handleFavoriteClick}
            className={`p-2 rounded-full backdrop-blur-md transition-transform pointer-events-auto active:scale-90 ${
              isFavorited
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white/80 text-stone-700 hover:text-rose-500 hover:bg-white'
            }`}
            aria-label="Save Favorite"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom match indicator (The Intelligent Core Feature) */}
        {highlightMatch && match && (
          <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between text-xs">
            <span
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] shadow-md flex items-center gap-1.5 ${
                matchPct >= 80
                  ? 'bg-emerald-600 text-white'
                  : matchPct >= 50
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-800 text-stone-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span>{matchPct}% Match</span>
            </span>

            <span className="text-[11px] font-semibold text-white/90 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md">
              {missingCount === 0 ? '✓ All ingredients in pantry' : `${missingCount} missing`}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#a23e18]">
              {recipe.category || 'Recipe'}
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-[11px] font-medium text-stone-500">
              {recipe.difficulty || 'Easy'}
            </span>
          </div>

          <h3 className="font-serif text-base font-bold text-stone-900 group-hover:text-[#003629] transition-colors line-clamp-1">
            {recipe.title}
          </h3>

          <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
            {recipe.description || 'Delicious culinary creation with balanced ingredients and step-by-step instructions.'}
          </p>

          {/* Custom Searchable Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              {recipe.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70"
                >
                  #{t}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className="text-[10px] font-medium text-stone-400">
                  +{recipe.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer meta: Cook Time, Servings, View Action */}
        <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>{(recipe.cookTime || 20) + (recipe.prepTime || 10)}m</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              <span>{recipe.servings || 2} srv</span>
            </div>
          </div>

          <div className="flex items-center gap-1 font-semibold text-xs text-[#003629] group-hover:underline">
            <span>View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
