import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ChefHat, 
  Image, 
  Clock, 
  Users, 
  ArrowLeft, 
  Save, 
  Layers, 
  ListOrdered,
  Tag,
  Hash,
  X,
  Check,
  Sparkles
} from 'lucide-react';
import { recipeService, IRecipe, IIngredient } from '../services/recipeService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const SUGGESTED_TAGS = [
  'Vegan',
  'Quick',
  'Gluten-Free',
  'High-Protein',
  'Dairy-Free',
  'Keto',
  'Low-Carb',
  'Meal-Prep',
  'Budget-Friendly',
  'One-Pot',
  'Kid-Friendly',
  'Comfort Food',
  'Air Fryer',
  'Under 30 Mins',
];

interface CreateRecipePageProps {
  recipeId?: string; // If present, edit mode
  onNavigate: (tab: string, recipeId?: string) => void;
  onBack: () => void;
}

export const CreateRecipePage: React.FC<CreateRecipePageProps> = ({
  recipeId,
  onNavigate,
  onBack,
}) => {
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  const isEdit = Boolean(recipeId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [cuisine, setCuisine] = useState('Italian');
  const [category, setCategory] = useState('Dinner');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [prepTime, setPrepTime] = useState<number>(15);
  const [cookTime, setCookTime] = useState<number>(25);
  const [servings, setServings] = useState<number>(4);
  const [dietaryType, setDietaryType] = useState('Vegetarian');
  const [tags, setTags] = useState<string[]>(['Quick', 'Gluten-Free']);
  const [tagInput, setTagInput] = useState('');
  const [tagError, setTagError] = useState('');
  const [calories, setCalories] = useState<number>(450);

  const [ingredients, setIngredients] = useState<IIngredient[]>([
    { name: '', quantity: '1', unit: 'cup', aisle: 'Pantry' },
  ]);

  const [instructions, setInstructions] = useState<string[]>([
    '',
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit && recipeId) {
      const targetId: string = recipeId;
      async function loadRecipeForEdit() {
        try {
          setIsLoading(true);
          const r = await recipeService.getRecipeById(targetId);
          if (r) {
            setTitle(r.title);
            setDescription(r.description);
            setImage(r.image);
            setCuisine(r.cuisine);
            setCategory(r.category);
            setDifficulty(r.difficulty);
            setPrepTime(r.prepTime);
            setCookTime(r.cookTime);
            setServings(r.servings);
            setDietaryType(r.dietaryType || 'Vegetarian');
            if (Array.isArray(r.tags) && r.tags.length > 0) {
              setTags(r.tags);
            }
            setCalories(r.calories || 400);
            if (r.ingredients?.length) setIngredients(r.ingredients);
            if (r.instructions?.length) setInstructions(r.instructions);
          }
        } catch (e) {
          showToast('Failed to load recipe for editing', 'error');
        } finally {
          setIsLoading(false);
        }
      }
      loadRecipeForEdit();
    }
  }, [isEdit, recipeId]);

  // Tags management
  const handleAddTag = (rawTag?: string) => {
    const target = (rawTag !== undefined ? rawTag : tagInput).trim();
    if (!target) return;

    const cleaned = target.replace(/^#+/, '').replace(/\s+/g, ' ').trim();

    if (cleaned.length < 2) {
      setTagError('Tag must be at least 2 characters');
      showToast('Tag must be at least 2 characters', 'info');
      return;
    }

    if (cleaned.length > 35) {
      setTagError('Tag must be 35 characters or less');
      showToast('Tag must be 35 characters or less', 'info');
      return;
    }

    if (tags.some((t) => t.toLowerCase() === cleaned.toLowerCase())) {
      setTagError(`"${cleaned}" is already added.`);
      showToast(`"${cleaned}" is already in your tags list`, 'info');
      setTagInput('');
      return;
    }

    // Title case formatting
    const formatted = cleaned
      .split(' ')
      .map((word) =>
        word
          .split('-')
          .map((sub) => (sub.length > 0 ? sub.charAt(0).toUpperCase() + sub.slice(1) : ''))
          .join('-')
      )
      .join(' ');

    setTags([...tags, formatted]);
    setTagInput('');
    setTagError('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase()));
    setTagError('');
  };

  const handleToggleSuggestedTag = (suggested: string) => {
    if (tags.some((t) => t.toLowerCase() === suggested.toLowerCase())) {
      handleRemoveTag(suggested);
    } else {
      handleAddTag(suggested);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleClearAllTags = () => {
    setTags([]);
    setTagError('');
  };

  // Ingredients handler
  const handleIngredientChange = (index: number, field: keyof IIngredient, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addIngredientRow = () => {
    setIngredients([...ingredients, { name: '', quantity: '1', unit: 'tbsp', aisle: 'Pantry' }]);
  };

  const removeIngredientRow = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  // Instructions handler
  const handleInstructionChange = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const addInstructionRow = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstructionRow = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Please provide a recipe title', 'error');
      return;
    }

    const validIngredients = ingredients.filter((ing) => ing.name.trim() !== '');
    if (validIngredients.length === 0) {
      showToast('Please add at least one ingredient', 'error');
      return;
    }

    const validInstructions = instructions.filter((inst) => inst.trim() !== '');
    if (validInstructions.length === 0) {
      showToast('Please provide at least one cooking instruction step', 'error');
      return;
    }

    // Auto-commit any typed text in tagInput before submitting
    let finalTags = [...tags];
    if (tagInput.trim()) {
      const extra = tagInput.trim().replace(/^#+/, '').replace(/\s+/g, ' ');
      if (extra.length >= 2 && !finalTags.some(t => t.toLowerCase() === extra.toLowerCase())) {
        finalTags.push(extra);
      }
    }

    const payload: Partial<IRecipe> = {
      title: title.trim(),
      description: description.trim(),
      image: image.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop',
      cuisine,
      category,
      difficulty,
      prepTime: Number(prepTime),
      cookTime: Number(cookTime),
      servings: Number(servings),
      dietaryType,
      calories: Number(calories),
      tags: finalTags,
      ingredients: validIngredients,
      instructions: validInstructions,
    };

    try {
      setIsSubmitting(true);
      if (isEdit && recipeId) {
        await recipeService.updateRecipe(recipeId, payload);
        showToast('Recipe successfully updated in MongoDB!', 'success');
        onNavigate('recipe-detail', recipeId);
      } else {
        const res = await recipeService.createRecipe(payload);
        showToast('New recipe successfully created and added to culinary database!', 'success');
        onNavigate('recipe-detail', res.data?._id);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error saving recipe', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#003629] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-mono">Loading recipe details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="font-serif text-3xl font-extrabold text-[#003629] tracking-tight">
            {isEdit ? 'Edit Recipe Studio' : 'Create New Recipe'}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Structured relational schema ensuring exact pantry matching algorithm compatibility.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Core Info */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">
            Basic Overview
          </h2>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Recipe Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Creamy Tuscan Garlic Butter Salmon"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#003629]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Summary / Culinary Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the textures, aromatics, and dish background..."
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#003629]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#003629]"
            />
          </div>

          {/* Grid Attributes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Cuisine</label>
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="w-full p-2 rounded-xl border border-stone-300 bg-white text-stone-900"
              >
                {['Italian', 'French', 'Asian', 'Mediterranean', 'Modern American', 'Indian', 'Mexican'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Meal Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 rounded-xl border border-stone-300 bg-white text-stone-900"
              >
                {['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Complexity</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full p-2 rounded-xl border border-stone-300 bg-white text-stone-900"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Dietary Type</label>
              <select
                value={dietaryType}
                onChange={(e) => setDietaryType(e.target.value)}
                className="w-full p-2 rounded-xl border border-stone-300 bg-white text-stone-900"
              >
                {['Vegetarian', 'Vegan', 'Non-Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Keto'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Numbers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Prep Time (mins)</label>
              <input
                type="number"
                min="1"
                value={prepTime}
                onChange={(e) => setPrepTime(Number(e.target.value))}
                className="w-full p-2 rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Cook Time (mins)</label>
              <input
                type="number"
                min="0"
                value={cookTime}
                onChange={(e) => setCookTime(Number(e.target.value))}
                className="w-full p-2 rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Servings</label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="w-full p-2 rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Calories (kcal)</label>
              <input
                type="number"
                min="10"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="w-full p-2 rounded-xl border border-stone-300"
              />
            </div>
          </div>

          {/* Custom Searchable Tags Section */}
          <div className="pt-4 border-t border-stone-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#003629]" />
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-800 font-mono">
                    Custom Searchable Tags
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {tags.length} {tags.length === 1 ? 'tag' : 'tags'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Add searchable tags (e.g. <strong>Vegan</strong>, <strong>Quick</strong>, <strong>Gluten-Free</strong>) so other cooks can find your recipe in searches and filters.
                </p>
              </div>

              {tags.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllTags}
                  className="self-start sm:self-auto text-[11px] font-semibold text-stone-500 hover:text-rose-600 transition-colors"
                >
                  Clear all tags
                </button>
              )}
            </div>

            {/* Active Tags Display */}
            <div>
              <span className="block text-[11px] font-semibold text-stone-600 mb-2 uppercase tracking-wide font-mono">
                Active Tags ({tags.length})
              </span>
              {tags.length === 0 ? (
                <div className="p-3.5 rounded-xl border border-dashed border-stone-300 bg-stone-50/70 text-center">
                  <p className="text-xs text-stone-500">
                    No tags attached yet. Type a tag below or select from popular culinary suggestions.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold shadow-2xs group transition-all"
                    >
                      <span className="text-emerald-600 font-mono text-[11px]">#</span>
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                        className="ml-1 p-0.5 rounded-md text-emerald-700 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Tag Input with Add Button */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wide font-mono">
                Add Custom Tag
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      if (tagError) setTagError('');
                    }}
                    onKeyDown={handleTagKeyDown}
                    placeholder="e.g. Vegan, Quick, Gluten-Free, High-Protein..."
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs text-stone-900 focus:outline-none transition-colors ${
                      tagError
                        ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                        : 'border-stone-300 focus:border-[#003629]'
                    }`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddTag()}
                  disabled={!tagInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#003629] text-white text-xs font-bold hover:bg-[#004d3d] disabled:opacity-40 transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tag</span>
                </button>
              </div>
              {tagError && (
                <p className="text-[11px] text-rose-600 font-medium">{tagError}</p>
              )}
              <p className="text-[11px] text-stone-400">
                Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-stone-100 border border-stone-300 rounded text-stone-600">Enter</kbd> or <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-stone-100 border border-stone-300 rounded text-stone-600">,</kbd> to attach. Tags are searchable across the app.
              </p>
            </div>

            {/* Quick Suggested Tags */}
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <span className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wide font-mono">
                Popular Searchable Suggestions (Click to toggle)
              </span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {SUGGESTED_TAGS.map((suggested) => {
                  const isSelected = tags.some((t) => t.toLowerCase() === suggested.toLowerCase());
                  return (
                    <button
                      type="button"
                      key={suggested}
                      onClick={() => handleToggleSuggestedTag(suggested)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#003629] text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80 border border-stone-200/60'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-stone-400" />
                      )}
                      <span>{suggested}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Discovery Info */}
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block text-amber-950">Search Discovery Preview</span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  When users filter by or type any of your tags ({tags.length > 0 ? tags.map((t) => `"${t}"`).join(', ') : '"Vegan", "Quick", "Gluten-Free"'}) in the Explore search bar or tag filters, this recipe will appear in their matched results.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Ingredients Section */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">
              Structured Ingredients ({ingredients.length})
            </h2>
            <button
              type="button"
              onClick={addIngredientRow}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Ingredient</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Ingredient name (e.g. Potato)"
                  value={ing.name}
                  onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                  className="flex-1 p-2 rounded-xl border border-stone-300"
                />
                <input
                  type="text"
                  placeholder="Qty (e.g. 2)"
                  value={ing.quantity}
                  onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
                  className="w-20 p-2 rounded-xl border border-stone-300"
                />
                <input
                  type="text"
                  placeholder="Unit (e.g. cups)"
                  value={ing.unit}
                  onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                  className="w-24 p-2 rounded-xl border border-stone-300"
                />
                <select
                  value={ing.aisle || 'Pantry'}
                  onChange={(e) => handleIngredientChange(idx, 'aisle', e.target.value)}
                  className="w-28 p-2 rounded-xl border border-stone-300 bg-white"
                >
                  <option value="Produce">Produce</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Meat">Meat</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Pantry">Pantry</option>
                  <option value="Spices">Spices</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeIngredientRow(idx)}
                  className="p-2 text-stone-400 hover:text-rose-500 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Ordered Instructions Section */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">
              Step-by-Step Instructions ({instructions.length})
            </h2>
            <button
              type="button"
              onClick={addInstructionRow}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Step</span>
            </button>
          </div>

          <div className="space-y-3">
            {instructions.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs">
                <span className="w-6 h-6 rounded-lg bg-[#003629] text-white flex items-center justify-center font-mono font-bold shrink-0 mt-2">
                  {idx + 1}
                </span>
                <textarea
                  rows={2}
                  placeholder={`Describe step ${idx + 1} in detail...`}
                  value={step}
                  onChange={(e) => handleInstructionChange(idx, e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-[#003629]"
                />
                <button
                  type="button"
                  onClick={() => removeInstructionRow(idx)}
                  className="p-2 text-stone-400 hover:text-rose-500 rounded-lg mt-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[#003629] text-white text-xs font-bold hover:bg-[#1b4d3e] shadow-md shadow-[#003629]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-emerald-300" />
            <span>{isSubmitting ? 'Saving to Database...' : isEdit ? 'Update Recipe' : 'Publish Recipe'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
