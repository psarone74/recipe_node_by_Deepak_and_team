import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  UtensilsCrossed, 
  CalendarDays, 
  Package2, 
  Heart, 
  Search, 
  Clock, 
  ArrowRight, 
  Flame, 
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePantry } from '../context/PantryContext';
import { recipeService, IRecipe } from '../services/recipeService';
import { mealPlanService, IMealPlan } from '../services/mealPlanService';
import { favoriteService } from '../services/favoriteService';
import { matchingService, IMatchItem } from '../services/matchingService';
import { RecipeCard } from '../components/common/RecipeCard';

interface DashboardPageProps {
  onNavigate: (tab: string, recipeId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { itemCount: pantryCount, pantryItems } = usePantry();
  
  const [topMatches, setTopMatches] = useState<IMatchItem[]>([]);
  const [todayMeals, setTodayMeals] = useState<IMealPlan[]>([]);
  const [favoriteCount, setFavoriteCount] = useState<number>(0);
  const [myRecipeCount, setMyRecipeCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        // Load matches
        const matchesData = await matchingService.getMatches({ minMatch: 50, sortBy: 'highestMatch' });
        if (matchesData?.matches) {
          setTopMatches(matchesData.matches.slice(0, 3));
        }

        // Load today's meals
        const mealsRes = await mealPlanService.getTodayMeals();
        if (mealsRes?.data) {
          setTodayMeals(mealsRes.data);
        }

        // Load favorite count
        const favsRes = await favoriteService.getFavorites();
        if (favsRes?.favoriteIds) {
          setFavoriteCount(favsRes.favoriteIds.length);
        } else if (favsRes?.data) {
          setFavoriteCount(favsRes.data.length);
        }

        // Load my recipes count
        const myRecRes = await recipeService.getMyRecipes();
        if (Array.isArray(myRecRes)) {
          setMyRecipeCount(myRecRes.length);
        }
      } catch (e) {
        console.warn('Dashboard load error:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('explore');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Greeting & Quick Search */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#003629] via-[#094234] to-[#125040] text-white p-6 sm:p-10 shadow-xl overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 uppercase tracking-widest font-mono">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Welcome back, {user?.name || 'Chef'}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            What's cooking today?
          </h1>

          <p className="text-xs sm:text-sm text-stone-200/90 leading-relaxed font-normal">
            You currently have <span className="font-bold text-white underline decoration-emerald-400 decoration-2">{pantryCount} ingredients</span> in stock.
            {topMatches.length > 0 && ` We found ${topMatches.length} high-match recipes ready to make right now.`}
          </p>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="relative flex items-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden focus-within:bg-white focus-within:text-stone-900 transition-all text-white max-w-md">
              <Search className="w-4 h-4 ml-3.5 text-stone-300 focus-within:text-stone-700 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes or craving..."
                className="w-full px-3 py-2.5 text-xs bg-transparent focus:outline-none placeholder-stone-300 focus-within:placeholder-stone-400 text-inherit"
              />
              <button
                type="submit"
                className="mr-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-stone-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
              >
                Go
              </button>
            </div>
          </form>
        </div>

        {/* Decorative corner background pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div 
          onClick={() => onNavigate('pantry')}
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm hover:border-[#003629]/40 cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Pantry In Stock</span>
            <Package2 className="w-4 h-4 text-[#003629]" />
          </div>
          <span className="font-serif text-3xl font-extrabold text-[#003629] block">
            {pantryCount}
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Ingredients tracked
          </span>
        </div>

        <div 
          onClick={() => onNavigate('smart-match')}
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm hover:border-[#003629]/40 cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Cookable Now</span>
            <Sparkles className="w-4 h-4 text-[#a23e18]" />
          </div>
          <span className="font-serif text-3xl font-extrabold text-[#a23e18] block">
            {topMatches.length}
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">
            ≥ 50% Pantry Match
          </span>
        </div>

        <div 
          onClick={() => onNavigate('meal-planner')}
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm hover:border-[#003629]/40 cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Today's Meals</span>
            <CalendarDays className="w-4 h-4 text-emerald-700" />
          </div>
          <span className="font-serif text-3xl font-extrabold text-stone-900 block">
            {todayMeals.length}
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Scheduled for today
          </span>
        </div>

        <div 
          onClick={() => onNavigate('favorites')}
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm hover:border-[#003629]/40 cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Favorite Recipes</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <span className="font-serif text-3xl font-extrabold text-stone-900 block">
            {favoriteCount}
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Saved in your cookbook
          </span>
        </div>

      </div>

      {/* Main Grid: Top Pantry Matches & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Top Pantry Matches (Intelligent Suggestion) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#a23e18] font-mono">
                Smart Suggestions
              </span>
              <h2 className="font-serif text-xl font-bold text-stone-900 mt-0.5">
                Cook With What You Have
              </h2>
            </div>
            <button
              onClick={() => onNavigate('smart-match')}
              className="text-xs font-bold text-[#003629] hover:underline flex items-center gap-1"
            >
              <span>View All Matches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {topMatches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topMatches.map((m) => (
                <RecipeCard
                  key={m.recipeId}
                  recipe={{
                    ...m.recipe,
                    pantryMatch: {
                      percentage: m.matchPercentage,
                      matched: m.matchedIngredients,
                      missing: m.missingIngredients,
                      totalIngredients: m.totalIngredients,
                    },
                  }}
                  onSelect={(id) => onNavigate('recipe-detail', id)}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-stone-200 text-center space-y-3">
              <Package2 className="w-8 h-8 text-stone-400 mx-auto" />
              <h3 className="font-bold text-sm text-stone-800">Your pantry needs ingredients!</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Add everyday staples like potatoes, eggs, pasta, or tomatoes to unlock instant recipe recommendations.
              </p>
              <button
                onClick={() => onNavigate('pantry')}
                className="px-4 py-2 rounded-xl bg-[#003629] text-white text-xs font-bold shadow-sm"
              >
                Add Ingredients to Pantry
              </button>
            </div>
          )}
        </div>

        {/* Right: Today's Scheduled Meals */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Today's Menu
            </h2>
            <button
              onClick={() => onNavigate('meal-planner')}
              className="text-xs font-semibold text-[#003629] hover:underline"
            >
              Planner
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3 shadow-sm">
            {todayMeals.length > 0 ? (
              todayMeals.map((meal) => (
                <div
                  key={meal._id}
                  onClick={() => onNavigate('recipe-detail', meal.recipeId)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-50 cursor-pointer border border-stone-100 transition-colors"
                >
                  <img
                    src={meal.recipeImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop'}
                    alt={meal.recipeTitle}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#a23e18] block">
                      {meal.mealType}
                    </span>
                    <h4 className="text-xs font-bold text-stone-900 truncate">
                      {meal.recipeTitle}
                    </h4>
                    <span className="text-[11px] text-stone-500">
                      {meal.cookTime || 20}m cook • {meal.calories || 400} kcal
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-stone-500 space-y-2">
                <CalendarDays className="w-6 h-6 text-stone-400 mx-auto" />
                <p>No meals scheduled for today yet.</p>
                <button
                  onClick={() => onNavigate('meal-planner')}
                  className="text-xs font-bold text-[#003629] underline"
                >
                  Schedule today's meals
                </button>
              </div>
            )}
          </div>

          {/* Quick Links banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#f0f5f0] to-[#e4ede5] border border-[#003629]/10 space-y-2 text-xs">
            <span className="font-bold text-[#003629] block">Quick Actions</span>
            <div className="space-y-1.5">
              <button
                onClick={() => onNavigate('create-recipe')}
                className="w-full text-left p-2 rounded-xl bg-white hover:bg-stone-50 font-medium text-stone-800 flex items-center justify-between shadow-xs"
              >
                <span>+ Create New Recipe in Studio</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </button>
              <button
                onClick={() => onNavigate('shopping-list')}
                className="w-full text-left p-2 rounded-xl bg-white hover:bg-stone-50 font-medium text-stone-800 flex items-center justify-between shadow-xs"
              >
                <span>View Shopping List & Aisle Sync</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
