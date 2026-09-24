import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Users, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ArrowLeft, 
  CalendarDays, 
  Bot, 
  ExternalLink,
  ChevronRight,
  BookOpen,
  Tag
} from 'lucide-react';
import { recipeService, IRecipe } from '../services/recipeService';
import { shoppingListService } from '../services/shoppingListService';
import { mealPlanService } from '../services/mealPlanService';
import { favoriteService } from '../services/favoriteService';
import { aiService, ICulinaryAdviceResponse } from '../services/aiService';
import { CookingTimerModal } from '../components/common/CookingTimerModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface RecipeDetailPageProps {
  recipeId: string;
  onNavigate: (tab: string, recipeId?: string, tag?: string) => void;
  onBack: () => void;
}

export const RecipeDetailPage: React.FC<RecipeDetailPageProps> = ({
  recipeId,
  onNavigate,
  onBack,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [recipe, setRecipe] = useState<IRecipe | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isCookingModeOpen, setIsCookingModeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Meal Planner quick schedule dialog state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleMealType, setScheduleMealType] = useState('dinner');

  // AI Culinary Advisor state
  const [aiSubstituteInput, setAiSubstituteInput] = useState('');
  const [aiAdvice, setAiAdvice] = useState<ICulinaryAdviceResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    async function loadRecipe() {
      try {
        setIsLoading(true);
        const data = await recipeService.getRecipeById(recipeId);
        setRecipe(data);

        if (isAuthenticated) {
          const favRes = await favoriteService.getFavorites();
          setIsFavorited(favRes.favoriteIds?.includes(recipeId) || false);
        }
      } catch (err: any) {
        showToast('Error loading recipe details', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadRecipe();
  }, [recipeId, isAuthenticated]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to favorite recipes', 'info');
      return;
    }
    try {
      const res = await favoriteService.toggleFavorite(recipeId);
      setIsFavorited(res.isFavorited);
      showToast(res.message, 'success');
    } catch (e: any) {
      showToast('Failed to toggle favorite', 'error');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe?.title || 'RecipeMaster Recipe',
        text: `Check out this recipe for ${recipe?.title} on RecipeMaster!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Recipe URL copied to clipboard!', 'success');
    }
  };

  const handleAddMissingIngredients = async () => {
    if (!recipe?.pantryMatch?.missing || recipe.pantryMatch.missing.length === 0) {
      showToast('No missing ingredients needed!', 'info');
      return;
    }
    try {
      await shoppingListService.addMissingIngredients(
        recipe.pantryMatch.missing,
        recipe.title
      );
      showToast(
        `Added ${recipe.pantryMatch.missing.length} missing items to your shopping list!`,
        'success'
      );
    } catch (e: any) {
      showToast('Failed to add missing ingredients', 'error');
    }
  };

  const handleScheduleMeal = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to schedule meals', 'info');
      return;
    }
    try {
      await mealPlanService.addMeal({
        recipeId,
        date: scheduleDate,
        mealType: scheduleMealType,
      });
      showToast(`Scheduled for ${scheduleDate} (${scheduleMealType})!`, 'success');
      setIsScheduleOpen(false);
    } catch (e: any) {
      showToast('Failed to schedule meal', 'error');
    }
  };

  const handleAskChefAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiSubstituteInput.trim()) return;

    try {
      setIsAiLoading(true);
      const advice = await aiService.getCulinaryAdvice({
        recipeTitle: recipe?.title,
        requestedSubstitute: aiSubstituteInput.trim(),
      });
      setAiAdvice(advice);
    } catch (e) {
      showToast('Culinary advisor could not complete request', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isLoading || !recipe) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#003629] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-mono">Loading recipe specifications & pantry calculus...</p>
      </div>
    );
  }

  const match = recipe.pantryMatch;
  const matchPct = match?.percentage ?? 0;
  const isAuthor = isAuthenticated && user?._id === recipe.author;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Breadcrumb Nav & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to recipes</span>
        </button>

        <div className="flex items-center gap-2">
          {isAuthor && (
            <button
              onClick={() => onNavigate('edit-recipe', recipe._id)}
              className="px-3.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Edit Recipe
            </button>
          )}

          <button
            onClick={handleShare}
            className="p-2 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-colors"
            title="Share recipe"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleFavoriteToggle}
            className={`p-2 rounded-xl border transition-colors ${
              isFavorited
                ? 'bg-rose-500 border-rose-500 text-white'
                : 'border-stone-200 bg-white text-stone-600 hover:text-rose-500'
            }`}
            title="Favorite recipe"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hero Visual Banner */}
      <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full rounded-3xl overflow-hidden shadow-xl bg-stone-900">
        <img
          src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&auto=format&fit=crop'}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Floating Hero Content */}
        <div className="absolute bottom-6 inset-x-6 sm:inset-x-8 text-white space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#003629] text-emerald-200 border border-emerald-700/60 backdrop-blur-md">
              {recipe.cuisine}
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-md">
              {recipe.category}
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-md">
              {recipe.difficulty}
            </span>
            {recipe.dietaryType && (
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#a23e18] text-white">
                {recipe.dietaryType}
              </span>
            )}
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {recipe.title}
          </h1>

          <p className="text-xs sm:text-sm text-stone-200 max-w-2xl line-clamp-2">
            {recipe.description}
          </p>
        </div>
      </div>

      {/* Recipe Specs & Primary Action Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white border border-stone-200 text-center shadow-xs">
        <div>
          <span className="text-[11px] text-stone-500 block uppercase font-mono">Prep Time</span>
          <span className="font-bold text-sm text-stone-800">{recipe.prepTime} mins</span>
        </div>
        <div>
          <span className="text-[11px] text-stone-500 block uppercase font-mono">Cook Time</span>
          <span className="font-bold text-sm text-stone-800">{recipe.cookTime} mins</span>
        </div>
        <div>
          <span className="text-[11px] text-stone-500 block uppercase font-mono">Servings</span>
          <span className="font-bold text-sm text-stone-800">{recipe.servings} portions</span>
        </div>
        <div>
          <span className="text-[11px] text-stone-500 block uppercase font-mono">Est. Energy</span>
          <span className="font-bold text-sm text-stone-800">{recipe.calories || 420} kcal</span>
        </div>
      </div>

      {/* Custom Searchable Tags Strip */}
      {recipe.tags && recipe.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3.5 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mr-1">
            <Tag className="w-3.5 h-3.5 text-[#003629]" />
            <span className="uppercase tracking-wider font-mono text-[11px]">Searchable Tags:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {recipe.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onNavigate('explore', undefined, tag)}
                title={`Find more recipes tagged with #${tag}`}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200/80 hover:bg-emerald-100 hover:border-emerald-300 transition-all cursor-pointer group"
              >
                <span className="text-emerald-600 font-mono text-[11px]">#</span>
                <span>{tag}</span>
                <span className="text-[10px] text-emerald-600/70 group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Action Bar: Cooking Mode + Meal Planner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#003629] to-[#0d4a3b] text-white shadow-md">
        <div>
          <span className="font-serif text-base font-bold block">Ready to start preparation?</span>
          <span className="text-xs text-emerald-200">
            Guided cooking with circular countdown timer, pot tracker, and audio alerts.
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsScheduleOpen(!isScheduleOpen)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold transition-colors"
          >
            <CalendarDays className="w-4 h-4 text-emerald-300" />
            <span>Schedule Meal</span>
          </button>

          <button
            onClick={() => setIsCookingModeOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-400 text-stone-950 text-xs font-extrabold hover:bg-emerald-300 transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            <Flame className="w-4 h-4 fill-current text-stone-950" />
            <span>Start Guided Cooking Mode</span>
          </button>
        </div>
      </div>

      {/* Schedule Meal Dropdown Dialog */}
      {isScheduleOpen && (
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 animate-in fade-in">
          <h4 className="text-xs font-bold text-stone-800 uppercase font-mono">Schedule Into Meal Planner</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Target Date</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full p-2 rounded-xl bg-white border border-stone-300 text-stone-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Meal Slot</label>
              <select
                value={scheduleMealType}
                onChange={(e) => setScheduleMealType(e.target.value)}
                className="w-full p-2 rounded-xl bg-white border border-stone-300 text-stone-800"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleScheduleMeal}
                className="w-full py-2.5 rounded-xl bg-[#003629] text-white font-bold text-xs hover:bg-[#1b4d3e]"
              >
                Confirm to Planner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Core Pantry Match Bar (The Intelligent Feature) */}
      {match && (
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#a23e18]" />
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Pantry Availability Analysis
              </h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                matchPct >= 80
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : matchPct >= 50
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-stone-100 text-stone-700'
              }`}
            >
              {matchPct}% Pantry Match
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* You Have */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                You Have ({match.matched.length} of {match.totalIngredients}):
              </span>
              <div className="space-y-1 text-emerald-950">
                {match.matched.length > 0 ? (
                  match.matched.map((m, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span>✓</span>
                      <span>{m}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-stone-400 italic">None in pantry</span>
                )}
              </div>
            </div>

            {/* You Need */}
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-2">
              <span className="font-bold text-rose-900 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                Missing To Buy ({match.missing.length}):
              </span>
              <div className="space-y-1 text-rose-950">
                {match.missing.length > 0 ? (
                  match.missing.map((m, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span>✗ {m.name}</span>
                      <span className="font-mono text-stone-500 text-[11px]">{m.quantity} {m.unit}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-emerald-700 font-bold">✓ Complete! Ready to cook.</span>
                )}
              </div>
            </div>
          </div>

          {match.missing.length > 0 && (
            <button
              onClick={handleAddMissingIngredients}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#a23e18] text-white text-xs font-bold hover:bg-[#853213] shadow-xs transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add Missing Ingredients to Shopping List</span>
            </button>
          )}
        </div>
      )}

      {/* Ingredients & Instructions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Ingredients Checklist */}
        <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
            Structured Ingredients ({recipe.ingredients.length})
          </h3>

          <ul className="space-y-2.5 text-xs text-stone-700">
            {recipe.ingredients.map((ing, i) => (
              <li
                key={i}
                className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-100"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#003629]" />
                  <span className="font-medium text-stone-900">{ing.name}</span>
                </div>
                <span className="font-mono font-semibold text-stone-600">
                  {ing.quantity} {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Ordered Step-by-Step Instructions */}
        <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
            Method & Step-by-Step Execution
          </h3>

          <div className="space-y-4">
            {recipe.instructions.map((step, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-xl bg-[#003629] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                  {idx + 1}
                </div>
                <div className="pt-0.5 text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* AI Chef Substitute & Culinary Guidance (Google Search Grounded) */}
      <div className="bg-[#121c17] text-stone-100 p-6 rounded-3xl border border-emerald-950 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-semibold block">
                Google Search Grounded Intelligence (gemini-3.5-flash)
              </span>
              <h3 className="font-serif text-base font-bold text-white">
                Chef Substitute & Scaling Advisor
              </h3>
            </div>
          </div>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed">
          Missing an ingredient or need culinary substitutions? Ask our Search-grounded assistant for verified chef ratios, chemical equivalents, and dietary modifications.
        </p>

        <form onSubmit={handleAskChefAi} className="flex gap-2">
          <input
            type="text"
            value={aiSubstituteInput}
            onChange={(e) => setAiSubstituteInput(e.target.value)}
            placeholder="e.g. What can I substitute for cheese in this recipe?"
            className="flex-1 px-4 py-2.5 rounded-xl bg-stone-900 border border-emerald-900 text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={isAiLoading || !aiSubstituteInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 text-stone-950 text-xs font-bold hover:bg-emerald-400 disabled:opacity-50 transition-colors shadow-xs"
          >
            {isAiLoading ? 'Searching...' : 'Ask Chef AI'}
          </button>
        </form>

        {aiAdvice && (
          <div className="p-4 rounded-2xl bg-[#17251f] border border-emerald-900/80 space-y-3 animate-in fade-in">
            <p className="text-xs text-stone-100 whitespace-pre-line leading-relaxed">
              {aiAdvice.answer}
            </p>

            {aiAdvice.groundingSources.length > 0 && (
              <div className="pt-2 border-t border-emerald-900/60 text-[11px] text-stone-400">
                <span className="font-mono text-emerald-400 block mb-1">Search Grounding Citations:</span>
                <div className="flex flex-wrap gap-2">
                  {aiAdvice.groundingSources.map((source, i) => (
                    <a
                      key={i}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-300 hover:underline"
                    >
                      <span>• {source.title || 'Culinary Source'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guided Cooking Mode Modal */}
      {isCookingModeOpen && (
        <CookingTimerModal
          recipe={recipe}
          onClose={() => setIsCookingModeOpen(false)}
        />
      )}

    </div>
  );
};
