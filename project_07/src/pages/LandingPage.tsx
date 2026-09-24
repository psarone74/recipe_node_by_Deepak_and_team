import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Package, 
  CalendarDays, 
  ShoppingCart, 
  Search, 
  Flame, 
  ChefHat, 
  ShieldCheck, 
  Database,
  Layers
} from 'lucide-react';
import { recipeService, IRecipe } from '../services/recipeService';
import { RecipeCard } from '../components/common/RecipeCard';

interface LandingPageProps {
  onNavigate: (tab: string, recipeId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [featuredRecipes, setFeaturedRecipes] = useState<IRecipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await recipeService.getRecipes({ limit: 3 });
        if (res?.data) {
          setFeaturedRecipes(res.data);
        }
      } catch (e) {
        console.warn('Error loading featured recipes:', e);
      }
    }
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('explore');
    }
  };

  return (
    <div className="space-y-24 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-[#f0f5f0] to-[#f6fbf5] border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Announcement */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#003629]/10 text-[#003629] text-xs font-semibold tracking-wide border border-[#003629]/20 shadow-sm animate-in fade-in">
              <Sparkles className="w-3.5 h-3.5 text-[#a23e18]" />
              <span>Intelligent Pantry Matching & Meal Orchestration</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#003629] tracking-tight leading-[1.15]">
              Cook smarter with what you <span className="text-[#a23e18] italic underline decoration-[#a23e18]/30">already have</span>.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-normal">
              Say goodbye to food waste and frantic dinner runs. RecipeMaster compares your live pantry ingredients against our chef recipe library, calculates precise match percentages, and schedules weekly nutritious meals with one tap.
            </p>

            {/* Interactive Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto relative pt-2">
              <div className="relative flex items-center shadow-lg rounded-2xl overflow-hidden border-2 border-[#003629]/20 bg-white focus-within:border-[#003629] transition-all">
                <Search className="w-5 h-5 text-stone-400 ml-4 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recipes by ingredients (e.g. potato, egg, tomato)..."
                  className="w-full px-3 py-3.5 text-sm text-stone-800 placeholder-stone-400 bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  className="mr-2 px-5 py-2.5 rounded-xl bg-[#003629] text-white text-xs font-bold hover:bg-[#1b4d3e] transition-colors shrink-0 shadow-sm"
                >
                  Search
                </button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => onNavigate('smart-match')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-[#003629] text-white text-sm font-bold shadow-lg shadow-[#003629]/25 hover:bg-[#1b4d3e] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Cook From My Pantry</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('explore')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white border border-stone-300 text-stone-800 text-sm font-bold shadow-sm hover:bg-stone-50 transition-colors"
              >
                <span>Explore Recipes</span>
              </button>
            </div>

            {/* Quick Micro Stats */}
            <div className="pt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto text-center border-t border-stone-200">
              <div>
                <span className="block font-serif text-2xl font-bold text-[#003629]">80%+</span>
                <span className="text-[11px] text-stone-500 font-medium">Smart Match Accuracy</span>
              </div>
              <div>
                <span className="block font-serif text-2xl font-bold text-[#003629]">100%</span>
                <span className="text-[11px] text-stone-500 font-medium">MERN REST Stack</span>
              </div>
              <div>
                <span className="block font-serif text-2xl font-bold text-[#003629]">Zero</span>
                <span className="text-[11px] text-stone-500 font-medium">Food Waste Goal</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* The Core Intelligent Feature Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#003629] text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Core Algorithm
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
                "What can I cook with the ingredients I already have?"
              </h2>
              <p className="text-stone-300 text-sm leading-relaxed">
                RecipeMaster extracts the stem of each ingredient in your pantry, strips prep adjectives, matches against required recipe elements, and computes an exact percentage score.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automatic singular/plural stemming (tomatoes → tomato)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Identifies missing ingredients for 1-click grocery generation</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sorts by highest match, quickest cook time, or lowest missing count</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onNavigate('smart-match')}
                  className="px-6 py-3 rounded-xl bg-white text-[#003629] text-xs font-bold hover:bg-stone-100 shadow-md transition-all hover:scale-105"
                >
                  Try Smart Pantry Engine Now
                </button>
              </div>
            </div>

            {/* Visual Example Card */}
            <div className="lg:col-span-6 bg-[#12231c] p-6 rounded-2xl border border-emerald-900 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-900/80 text-xs">
                <span className="font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                  Algorithm Simulation
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                  80% Match
                </span>
              </div>

              <div className="py-4 space-y-4">
                <div>
                  <span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider block mb-1.5">
                    User Pantry Inventory (4 Items)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Tomato', 'Onion', 'Potato', 'Egg'].map((item) => (
                      <span key={item} className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 text-xs font-medium border border-emerald-800 flex items-center gap-1">
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider block mb-1.5">
                    Recipe: Farmhouse Herb Potato Omelette (5 Items)
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80">
                      <span className="font-semibold text-emerald-300 block mb-1">Available (4):</span>
                      <p className="text-stone-300 leading-tight">✓ Tomato, Onion, Potato, Egg</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/80">
                      <span className="font-semibold text-rose-300 block mb-1">Missing (1):</span>
                      <p className="text-rose-200 leading-tight">✗ Cheese (Add to Shopping List)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Recipes Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#a23e18] font-mono">
              Curated Masterpieces
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#003629] tracking-tight mt-1">
              Featured Tested Recipes
            </h2>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-bold text-[#003629] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              onSelect={(id) => onNavigate('recipe-detail', id)}
            />
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#a23e18] font-mono">
            Full-Stack Capabilities
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#003629] tracking-tight mt-1">
            Complete Ecosystem for Modern Home Cooking
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#003629]/10 text-[#003629] flex items-center justify-center">
              <Package className="w-5 h-5 text-[#003629]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Pantry Inventory & Expiry
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Track stock levels, expiration radars, and categorized aisles (Produce, Dairy, Pantry, Seafood) to prevent spoilage and save money.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#a23e18]/10 text-[#a23e18] flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-[#a23e18]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Weekly Meal Scheduler
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              7-day visual planner spanning Breakfast, Lunch, Dinner, and Snacks with aggregated nutrition, prep times, and pantry utilization gauges.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-emerald-800" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Auto-Stock Grocery List
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Automatically extract missing ingredients from recipes into aisle checklists. When bought, 1-click moves them into your pantry inventory!
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};
