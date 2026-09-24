import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit3, ArrowRight } from 'lucide-react';
import { recipeService, IRecipe } from '../services/recipeService';
import { RecipeCard } from '../components/common/RecipeCard';
import { useToast } from '../context/ToastContext';

interface MyRecipesPageProps {
  onNavigate: (tab: string, recipeId?: string) => void;
}

export const MyRecipesPage: React.FC<MyRecipesPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [recipes, setRecipes] = useState<IRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMyRecipes();
  }, []);

  const loadMyRecipes = async () => {
    try {
      setIsLoading(true);
      const data = await recipeService.getMyRecipes();
      if (Array.isArray(data)) {
        setRecipes(data);
      }
    } catch (e) {
      showToast('Error loading your recipes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await recipeService.deleteRecipe(id);
      showToast('Recipe deleted from database', 'info');
      setRecipes((prev) => prev.filter((r) => r._id !== id));
    } catch (err: any) {
      showToast('Failed to delete recipe', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#a23e18] font-mono">
            Authored Creations
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#003629] tracking-tight mt-1">
            My Recipe Studio ({recipes.length})
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Manage your personal recipe drafts, published creations, and imported kitchen archives.
          </p>
        </div>

        <button
          onClick={() => onNavigate('create-recipe')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#003629] text-white text-xs font-bold hover:bg-[#1b4d3e] shadow-md shadow-[#003629]/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 text-emerald-300" />
          <span>New Recipe</span>
        </button>
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
            <div key={recipe._id} className="relative group">
              <RecipeCard
                recipe={recipe}
                onSelect={(id) => onNavigate('recipe-detail', id)}
              />

              {/* Action Overlay */}
              <div className="absolute top-3 right-14 flex items-center gap-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('edit-recipe', recipe._id);
                  }}
                  className="p-2 rounded-full bg-white/90 backdrop-blur-md text-stone-700 hover:text-[#003629] shadow-xs"
                  title="Edit Recipe"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => handleDelete(recipe._id || '', e)}
                  className="p-2 rounded-full bg-white/90 backdrop-blur-md text-stone-700 hover:text-rose-500 shadow-xs"
                  title="Delete Recipe"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-stone-200 space-y-3 max-w-md mx-auto">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-serif font-bold text-base text-stone-800">No authored recipes yet</h3>
          <p className="text-xs text-stone-500">
            Create your first culinary recipe with structured ingredients and instructions or import from TheMealDB.
          </p>
          <button
            onClick={() => onNavigate('create-recipe')}
            className="px-5 py-2.5 rounded-xl bg-[#003629] text-white text-xs font-bold"
          >
            Create First Recipe
          </button>
        </div>
      )}

    </div>
  );
};
