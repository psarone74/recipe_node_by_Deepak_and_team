import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Globe, 
  Database, 
  ArrowRight, 
  Download, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Layers,
  Tag,
  Hash,
  X
} from 'lucide-react';
import { recipeService, IRecipe } from '../services/recipeService';
import { externalRecipeService } from '../services/externalRecipeService';
import { RecipeCard } from '../components/common/RecipeCard';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface ExplorePageProps {
  onNavigate: (tab: string, recipeId?: string, tag?: string) => void;
  initialTag?: string;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ onNavigate, initialTag }) => {
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  // Mode: 'db' (MERN MongoDB recipes) or 'external' (TheMealDB public API)
  const [sourceMode, setSourceMode] = useState<'db' | 'external'>('db');

  // DB Filter States
  const [recipes, setRecipes] = useState<IRecipe[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>(initialTag || 'All');
  const [availableTags, setAvailableTags] = useState<string[]>([
    'Vegan',
    'Quick',
    'Gluten-Free',
    'High-Protein',
    'Dairy-Free',
    'Keto',
    'Budget-Friendly',
    'One-Pot',
  ]);
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDiet, setSelectedDiet] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [maxCookTime, setMaxCookTime] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sync initialTag prop
  useEffect(() => {
    if (initialTag) {
      setSelectedTag(initialTag);
      setPage(1);
    }
  }, [initialTag]);

  // Load dynamically created custom tags from API
  useEffect(() => {
    async function loadTags() {
      try {
        const fetched = await recipeService.getAllTags();
        if (Array.isArray(fetched) && fetched.length > 0) {
          const combined = Array.from(
            new Set([...fetched, 'Vegan', 'Quick', 'Gluten-Free', 'High-Protein'])
          );
          setAvailableTags(combined);
        }
      } catch (e) {
        console.warn('Could not fetch recipe tags', e);
      }
    }
    loadTags();
  }, []);

  // External Recipes
  const [externalRecipes, setExternalRecipes] = useState<IRecipe[]>([]);
  const [externalQuery, setExternalQuery] = useState('pasta');
  const [isImporting, setIsImporting] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const cuisines = ['All', 'French', 'Italian', 'Asian', 'Mediterranean', 'Modern American', 'Indian'];
  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'];
  const diets = ['All', 'Vegetarian', 'Vegan', 'Non-Vegetarian', 'Gluten-Free'];

  // Fetch DB recipes
  useEffect(() => {
    if (sourceMode !== 'db') return;

    async function fetchDBRecipes() {
      try {
        setIsLoading(true);
        const res = await recipeService.getRecipes({
          search,
          cuisine: selectedCuisine,
          category: selectedCategory,
          dietaryType: selectedDiet,
          difficulty: selectedDifficulty,
          maxCookTime: maxCookTime ? parseInt(maxCookTime, 10) : undefined,
          tag: selectedTag !== 'All' ? selectedTag : undefined,
          page,
          limit: 12,
        });

        if (res?.data) {
          setRecipes(res.data);
          setTotalPages(res.pagination?.pages || 1);
          setTotalCount(res.pagination?.total || 0);
        }
      } catch (err: any) {
        showToast('Error loading recipes', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchDBRecipes();
    }, 250);

    return () => clearTimeout(timer);
  }, [sourceMode, search, selectedCuisine, selectedCategory, selectedDiet, selectedDifficulty, maxCookTime, selectedTag, page]);

  // Fetch External recipes
  const handleFetchExternal = async (q: string = externalQuery) => {
    try {
      setIsLoading(true);
      const meals = await externalRecipeService.search(q);
      setExternalRecipes(meals);
    } catch (e: any) {
      showToast('Error querying TheMealDB', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sourceMode === 'external') {
      handleFetchExternal('chicken');
    }
  }, [sourceMode]);

  const handleImportToStudio = async (recipe: IRecipe) => {
    if (!isAuthenticated) {
      showToast('Please sign in to import recipes to your Recipe Studio', 'info');
      return;
    }
    try {
      setIsImporting(recipe._id || '');
      const imported = await externalRecipeService.importToMyStudio(recipe._id || '');
      showToast(`Imported "${recipe.title}" to your recipes!`, 'success');
      onNavigate('recipe-detail', imported._id);
    } catch (err: any) {
      showToast('Error importing recipe', 'error');
    } finally {
      setIsImporting(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Heading & Source Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#a23e18] font-mono">
            Culinary Archives
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#003629] tracking-tight mt-1">
            Explore Tested Recipes
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Browse our database recipes with live pantry match analysis or search the global TheMealDB archive.
          </p>
        </div>

        {/* Source Toggle Pill */}
        <div className="flex items-center p-1 bg-stone-200/80 rounded-2xl border border-stone-300/80">
          <button
            onClick={() => setSourceMode('db')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              sourceMode === 'db'
                ? 'bg-white text-[#003629] shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-[#003629]" />
            <span>MongoDB Database ({totalCount})</span>
          </button>

          <button
            onClick={() => setSourceMode('external')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              sourceMode === 'external'
                ? 'bg-white text-[#003629] shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#a23e18]" />
            <span>TheMealDB API</span>
          </button>
        </div>
      </div>

      {/* Database Mode Filters */}
      {sourceMode === 'db' && (
        <div className="space-y-4">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, ingredient, tag, cuisine (e.g. pasta, garlic, high-protein)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#003629] shadow-xs"
            />
          </div>

          {/* Searchable Tags Filter Bar */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-stone-600 font-semibold">
                <Tag className="w-3.5 h-3.5 text-[#003629]" />
                <span className="text-[11px] uppercase tracking-wider font-mono">Custom Searchable Tags</span>
              </div>
              {selectedTag !== 'All' && (
                <button
                  onClick={() => {
                    setSelectedTag('All');
                    setPage(1);
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>Reset tag filter</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedTag('All');
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedTag === 'All'
                    ? 'bg-[#003629] text-white shadow-2xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                All Tags
              </button>

              {availableTags.map((tag) => {
                const isSelected = selectedTag.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => {
                      setSelectedTag(isSelected ? 'All' : tag);
                      setPage(1);
                    }}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#003629] text-white shadow-2xs'
                        : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <span className={isSelected ? 'text-emerald-300 font-mono text-[11px]' : 'text-stone-400 font-mono text-[11px]'}>#</span>
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>

            {selectedTag !== 'All' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium animate-in fade-in duration-150">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Showing recipes tagged with <strong>#{selectedTag}</strong> ({totalCount} found)</span>
              </div>
            )}
          </div>

          {/* Quick Filter Selects */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-stone-600 block mb-1">Cuisine</label>
              <select
                value={selectedCuisine}
                onChange={(e) => {
                  setSelectedCuisine(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2.5 rounded-xl bg-white border border-stone-200 text-stone-800 focus:outline-none focus:border-[#003629]"
              >
                {cuisines.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-600 block mb-1">Meal Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2.5 rounded-xl bg-white border border-stone-200 text-stone-800 focus:outline-none focus:border-[#003629]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-600 block mb-1">Dietary Filter</label>
              <select
                value={selectedDiet}
                onChange={(e) => {
                  setSelectedDiet(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2.5 rounded-xl bg-white border border-stone-200 text-stone-800 focus:outline-none focus:border-[#003629]"
              >
                {diets.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-600 block mb-1">Max Total Time</label>
              <select
                value={maxCookTime}
                onChange={(e) => {
                  setMaxCookTime(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2.5 rounded-xl bg-white border border-stone-200 text-stone-800 focus:outline-none focus:border-[#003629]"
              >
                <option value="">Any Duration</option>
                <option value="15">Under 15 Mins</option>
                <option value="30">Under 30 Mins</option>
                <option value="45">Under 45 Mins</option>
                <option value="60">Under 60 Mins</option>
              </select>
            </div>
          </div>

          {/* Recipes Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="rounded-2xl bg-white p-4 h-80 border border-stone-200 animate-pulse space-y-3">
                  <div className="h-44 bg-stone-200 rounded-xl" />
                  <div className="h-4 bg-stone-200 rounded w-2/3" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : recipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  onSelect={(id) => onNavigate('recipe-detail', id)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
              <Search className="w-8 h-8 text-stone-400 mx-auto" />
              <h3 className="font-bold text-sm text-stone-800">No recipes matched your query</h3>
              <p className="text-xs text-stone-500">Try adjusting your filters or search keywords.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCuisine('All');
                  setSelectedCategory('All');
                  setSelectedDiet('All');
                  setMaxCookTime('');
                }}
                className="px-4 py-2 rounded-xl bg-[#003629] text-white text-xs font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold text-stone-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-xs font-mono text-stone-500">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold text-stone-700 disabled:opacity-40"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* External TheMealDB Mode */}
      {sourceMode === 'external' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
            <Globe className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Third-Party Food API Gateway:</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Calling public TheMealDB REST endpoints normalized through our Express backend proxy. You can import any external recipe into your local MongoDB Recipe Studio with 1-click.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFetchExternal(externalQuery);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={externalQuery}
                onChange={(e) => setExternalQuery(e.target.value)}
                placeholder="Search TheMealDB archives (e.g. curry, beef, pasta, soup)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#003629]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-[#003629] text-white text-xs font-bold hover:bg-[#1b4d3e] transition-colors shrink-0 shadow-sm"
            >
              Search TheMealDB
            </button>
          </form>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-2xl bg-white p-4 h-72 border border-stone-200 animate-pulse space-y-3">
                  <div className="h-40 bg-stone-200 rounded-xl" />
                  <div className="h-4 bg-stone-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : externalRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {externalRecipes.map((meal) => (
                <div
                  key={meal._id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] bg-stone-100">
                    <img
                      src={meal.image}
                      alt={meal.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-[#003629] shadow-xs">
                      {meal.cuisine} • {meal.category}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-serif font-bold text-base text-stone-900 line-clamp-1">
                        {meal.title}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                        {meal.description}
                      </p>
                      <span className="text-[11px] font-semibold text-[#a23e18] block mt-1">
                        {meal.ingredients.length} Ingredients identified
                      </span>
                    </div>

                    <button
                      disabled={isImporting === meal._id}
                      onClick={() => handleImportToStudio(meal)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#003629] text-white text-xs font-bold hover:bg-[#1b4d3e] transition-colors shadow-xs"
                    >
                      {isImporting === meal._id ? (
                        <span>Importing to MongoDB...</span>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Import to My Recipe Studio</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
              <p className="text-xs text-stone-500">No external recipes found for query "{externalQuery}".</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
