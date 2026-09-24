import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  UtensilsCrossed, 
  Clock, 
  Flame, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { mealPlanService, IMealPlan } from '../services/mealPlanService';
import { recipeService, IRecipe } from '../services/recipeService';
import { useToast } from '../context/ToastContext';

interface MealPlannerPageProps {
  onNavigate: (tab: string, recipeId?: string) => void;
}

export const MealPlannerPage: React.FC<MealPlannerPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();

  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, Record<string, IMealPlan[]>>>({});
  const [summary, setSummary] = useState({ totalMeals: 0, totalEstimatedCalories: 0, estimatedCookMinutes: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Add meal modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<string>('dinner');
  const [availableRecipes, setAvailableRecipes] = useState<IRecipe[]>([]);
  const [chosenRecipeId, setChosenRecipeId] = useState<string>('');

  const mealSlots = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

  // Calculate current week dates (Monday to Sunday)
  const weekDays = React.useMemo(() => {
    const today = new Date();
    // Offset by week
    const monday = new Date(today);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1) + currentWeekOffset * 7;
    monday.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString(undefined, { weekday: 'short' }),
        formatted: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        isToday: d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0],
      });
    }
    return days;
  }, [currentWeekOffset]);

  const startDate = weekDays[0].dateStr;
  const endDate = weekDays[6].dateStr;

  useEffect(() => {
    async function loadWeek() {
      try {
        setIsLoading(true);
        const res = await mealPlanService.getWeeklyPlan(startDate, endDate);
        if (res?.data) {
          setWeeklyPlan(res.data);
          if (res.summary) {
            setSummary(res.summary);
          }
        }
      } catch (e) {
        showToast('Error loading weekly meal plan', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadWeek();
  }, [startDate, endDate]);

  useEffect(() => {
    async function loadRecipes() {
      try {
        const res = await recipeService.getRecipes({ limit: 50 });
        if (res?.data) {
          setAvailableRecipes(res.data);
          if (res.data.length > 0) setChosenRecipeId(res.data[0]._id || '');
        }
      } catch (e) {
        console.warn('Failed to load recipe library:', e);
      }
    }
    loadRecipes();
  }, []);

  const handleOpenAddMeal = (dateStr: string, slot: string) => {
    setSelectedDate(dateStr);
    setSelectedMealType(slot);
    setIsAddModalOpen(true);
  };

  const handleSaveMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chosenRecipeId) return;

    try {
      await mealPlanService.addMeal({
        recipeId: chosenRecipeId,
        date: selectedDate,
        mealType: selectedMealType,
      });
      showToast('Scheduled meal into weekly calendar!', 'success');
      setIsAddModalOpen(false);

      // Refresh
      const res = await mealPlanService.getWeeklyPlan(startDate, endDate);
      if (res?.data) {
        setWeeklyPlan(res.data);
        if (res.summary) setSummary(res.summary);
      }
    } catch (e) {
      showToast('Error scheduling meal', 'error');
    }
  };

  const handleDeleteMeal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await mealPlanService.deleteMeal(id);
      showToast('Meal slot cleared', 'info');

      // Refresh
      const res = await mealPlanService.getWeeklyPlan(startDate, endDate);
      if (res?.data) {
        setWeeklyPlan(res.data);
        if (res.summary) setSummary(res.summary);
      }
    } catch (e) {
      showToast('Failed to delete meal', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header with Week Nav */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#a23e18] font-mono">
            Nutrition & Prep Scheduler
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#003629] tracking-tight mt-1">
            Weekly Meal Planner
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Map out your culinary week to minimize waste and streamline grocery preparation.
          </p>
        </div>

        {/* Week Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
            className="p-2 rounded-xl border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-mono text-xs font-bold text-stone-800">
            {weekDays[0].formatted} – {weekDays[6].formatted}
          </span>

          <button
            onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
            className="p-2 rounded-xl border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-white border border-stone-200 shadow-xs text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#003629]/10 text-[#003629] flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm text-stone-900 block">{summary.totalMeals} Scheduled</span>
            <span className="text-stone-500">Planned meals this week</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#a23e18]/10 text-[#a23e18] flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm text-stone-900 block">{summary.totalEstimatedCalories} Total Kcal</span>
            <span className="text-stone-500">Aggregated week energy</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm text-stone-900 block">{summary.estimatedCookMinutes} Minutes</span>
            <span className="text-stone-500">Estimated total kitchen time</span>
          </div>
        </div>
      </div>

      {/* 7-Day Interactive Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayMealsBySlot = weeklyPlan[day.dateStr] || {};

          return (
            <div
              key={day.dateStr}
              className={`rounded-2xl border flex flex-col justify-between overflow-hidden shadow-2xs ${
                day.isToday
                  ? 'border-[#003629] bg-[#f6fbf5]'
                  : 'border-stone-200 bg-white'
              }`}
            >
              {/* Day Header */}
              <div
                className={`p-3 text-center border-b ${
                  day.isToday
                    ? 'bg-[#003629] text-white'
                    : 'bg-stone-50/80 border-stone-200 text-stone-800'
                }`}
              >
                <span className="font-mono text-[11px] font-bold block uppercase tracking-wider">
                  {day.dayName}
                </span>
                <span className="font-serif text-sm font-extrabold block">
                  {day.formatted}
                </span>
                {day.isToday && (
                  <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-300 block mt-0.5">
                    Today
                  </span>
                )}
              </div>

              {/* Slots for this day */}
              <div className="p-2 space-y-2.5 flex-1">
                {mealSlots.map((slot) => {
                  const meals = dayMealsBySlot[slot] || [];

                  return (
                    <div key={slot} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-400 font-mono">
                        <span>{slot}</span>
                        <button
                          onClick={() => handleOpenAddMeal(day.dateStr, slot)}
                          className="p-0.5 rounded text-stone-400 hover:text-[#003629]"
                          title={`Add ${slot}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {meals.length > 0 ? (
                        meals.map((meal) => (
                          <div
                            key={meal._id}
                            onClick={() => onNavigate('recipe-detail', meal.recipeId)}
                            className="p-2 rounded-xl bg-white border border-stone-200 hover:border-[#003629]/40 cursor-pointer shadow-2xs transition-all group relative"
                          >
                            <span className="font-serif text-xs font-bold text-stone-900 group-hover:text-[#003629] line-clamp-1 block">
                              {meal.recipeTitle}
                            </span>
                            <span className="text-[10px] text-stone-500 font-mono block">
                              {meal.cookTime || 20}m • {meal.calories || 400}kcal
                            </span>

                            <button
                              onClick={(e) => handleDeleteMeal(meal._id || '', e)}
                              className="absolute top-1 right-1 p-1 text-stone-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete from schedule"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div
                          onClick={() => handleOpenAddMeal(day.dateStr, slot)}
                          className="p-2 rounded-xl border border-dashed border-stone-200 text-center cursor-pointer hover:bg-stone-50 transition-colors"
                        >
                          <span className="text-[10px] text-stone-400 font-medium">+ Add</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Meal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Schedule Meal ({selectedMealType.toUpperCase()})
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMeal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Target Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Select Recipe</label>
                <select
                  value={chosenRecipeId}
                  onChange={(e) => setChosenRecipeId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-stone-900"
                >
                  {availableRecipes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.title} ({r.cuisine} • {r.cookTime}m)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#003629] text-white font-bold hover:bg-[#1b4d3e]"
                >
                  Add to Weekly Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
