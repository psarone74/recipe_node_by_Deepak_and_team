// server.ts
import path from "path";
import { fileURLToPath } from "url";
import express2 from "express";
import { createServer as createViteServer } from "vite";

// server/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// server/middleware/errorHandler.ts
function errorHandler(err, req, res, next) {
  console.error("Unhandled server error:", err);
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    message,
    ...process.env.NODE_ENV === "development" ? { stack: err.stack } : {}
  });
}

// server/routes/authRoutes.ts
import { Router } from "express";

// server/controllers/authController.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// server/models/User.ts
import mongoose, { Schema } from "mongoose";
var userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    profileImage: { type: String },
    dietaryPreferences: { type: [String], default: [] }
  },
  { timestamps: true }
);
var UserModel = mongoose.model("User", userSchema);

// server/controllers/authController.ts
var JWT_SECRET = process.env.JWT_SECRET || "recipemaster_jwt_super_secure_secret_key_2026";
async function register(req, res) {
  try {
    const { name, email, password, confirmPassword, dietaryPreferences } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required fields."
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long."
      });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password confirmation does not match."
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address."
      });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists."
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=003629`,
      dietaryPreferences: Array.isArray(dietaryPreferences) ? dietaryPreferences : []
    });
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    const { password: _, ...userSafe } = newUser;
    return res.status(201).json({
      success: true,
      message: "Registration successful! Welcome to RecipeMaster.",
      data: {
        user: userSafe,
        token
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during registration."
    });
  }
}
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password credentials."
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password credentials."
      });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    const { password: _, ...userSafe } = user;
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: userSafe,
        token
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during login."
    });
  }
}
async function getProfile(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const { password: _, ...userSafe } = req.user;
    return res.status(200).json({
      success: true,
      data: userSafe
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function updateProfile(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const { name, dietaryPreferences, profileImage } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (Array.isArray(dietaryPreferences)) updateData.dietaryPreferences = dietaryPreferences;
    if (profileImage) updateData.profileImage = profileImage;
    const updated = await UserModel.findByIdAndUpdate(req.user._id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    const { password: _, ...userSafe } = updated;
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: userSafe
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function changePassword(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required."
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters."
      });
    }
    const user = await UserModel.findById(req.user._id);
    if (!user || !user.password) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password incorrect."
      });
    }
    const newHashed = await bcrypt.hash(newPassword, 10);
    await UserModel.findByIdAndUpdate(user._id, { password: newHashed });
    return res.status(200).json({
      success: true,
      message: "Password changed successfully."
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// server/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var JWT_SECRET2 = process.env.JWT_SECRET || "recipemaster_jwt_super_secure_secret_key_2026";
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authorization token provided."
      });
    }
    const decoded = jwt2.verify(token, JWT_SECRET2);
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token: User account not found."
      });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again."
      });
    }
    return res.status(403).json({
      success: false,
      message: "Invalid authentication token."
    });
  }
}
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (token) {
      const decoded = jwt2.verify(token, JWT_SECRET2);
      const user = await UserModel.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (e) {
    next();
  }
}

// server/routes/authRoutes.ts
var router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);
router.put("/change-password", authenticateToken, changePassword);
var authRoutes_default = router;

// server/routes/recipeRoutes.ts
import { Router as Router2 } from "express";

// server/models/Recipe.ts
import mongoose2, { Schema as Schema2 } from "mongoose";
function formatTag(tag) {
  if (!tag || typeof tag !== "string") return "";
  let cleaned = tag.trim().replace(/^#+/, "").replace(/\s+/g, " ");
  if (cleaned.length < 2 || cleaned.length > 35) return "";
  return cleaned.split(" ").map((word) => word.split("-").map((sub) => sub.length > 0 ? sub.charAt(0).toUpperCase() + sub.slice(1) : "").join("-")).join(" ");
}
function sanitizeRecipeTags(input) {
  if (!input) return [];
  const rawTags = Array.isArray(input) ? input : typeof input === "string" ? input.split(",") : [];
  const seen = /* @__PURE__ */ new Set();
  const sanitized = [];
  for (const raw of rawTags) {
    const formatted = formatTag(raw);
    if (formatted) {
      const lowerKey = formatted.toLowerCase();
      if (!seen.has(lowerKey)) {
        seen.add(lowerKey);
        sanitized.push(formatted);
      }
    }
  }
  return sanitized;
}
var ingredientSchema = new Schema2({
  name: { type: String, required: true },
  quantity: { type: Schema2.Types.Mixed, required: true },
  unit: { type: String, required: true },
  aisle: { type: String },
  category: { type: String }
}, { _id: false });
var recipeSchema = new Schema2({
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  author: { type: String, required: true },
  authorName: { type: String },
  ingredients: { type: [ingredientSchema], default: [] },
  instructions: { type: [String], default: [] },
  cuisine: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  prepTime: { type: Number, required: true },
  cookTime: { type: Number, required: true },
  servings: { type: Number, required: true },
  tags: { type: [String], default: [], index: true },
  dietaryType: { type: String },
  calories: { type: Number },
  isExternal: { type: Boolean, default: false },
  externalSourceUrl: { type: String }
}, { timestamps: true });
var RecipeModel = mongoose2.model("Recipe", recipeSchema);

// server/models/PantryItem.ts
import mongoose3, { Schema as Schema3 } from "mongoose";
var pantryItemSchema = new Schema3(
  {
    userId: { type: Schema3.Types.ObjectId, ref: "User", required: true },
    ingredient: { type: String, required: true },
    normalizedIngredient: { type: String },
    quantity: { type: Schema3.Types.Mixed, required: true },
    unit: { type: String, required: true },
    category: { type: String },
    expiryDate: { type: Date }
  },
  { timestamps: true }
);
pantryItemSchema.index({ userId: 1 });
var PantryItemModel = mongoose3.model("PantryItem", pantryItemSchema);

// server/services/recipeMatchingService.ts
function normalizeIngredient(raw) {
  if (!raw) return "";
  let str = raw.toLowerCase().trim();
  const descriptors = [
    "fresh",
    "organic",
    "chopped",
    "diced",
    "minced",
    "sliced",
    "grated",
    "crushed",
    "ground",
    "dried",
    "frozen",
    "cooked",
    "raw",
    "extra virgin",
    "clove of",
    "cloves of",
    "pinch of",
    "tablespoon of",
    "teaspoon of",
    "cup of"
  ];
  for (const desc of descriptors) {
    str = str.replace(new RegExp(`\\b${desc}\\b`, "gi"), "");
  }
  str = str.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  if (str.endsWith("ies") && str.length > 4) {
    str = str.slice(0, -3) + "y";
  } else if (str.endsWith("es") && str.length > 4 && !str.endsWith("cheese")) {
    str = str.slice(0, -2);
  } else if (str.endsWith("s") && !str.endsWith("ss") && !str.endsWith("us") && !str.endsWith("cheese")) {
    str = str.slice(0, -1);
  }
  return str.trim();
}
function isIngredientMatched(recipeIngName, pantryList) {
  const normRecipe = normalizeIngredient(recipeIngName);
  if (!normRecipe) return false;
  for (const pantryItem of pantryList) {
    const normPantry = normalizeIngredient(pantryItem);
    if (!normPantry) continue;
    if (normRecipe === normPantry) return true;
    if (normRecipe.includes(normPantry) || normPantry.includes(normRecipe)) {
      return true;
    }
    const recipeTokens = normRecipe.split(/\s+/).filter((w) => w.length > 2);
    const pantryTokens = normPantry.split(/\s+/).filter((w) => w.length > 2);
    const hasOverlap = recipeTokens.some((rt) => pantryTokens.some((pt) => pt === rt || pt.startsWith(rt) || rt.startsWith(pt)));
    if (hasOverlap) return true;
  }
  return false;
}
function computeRecipeMatches(recipes, pantryItems, options) {
  const pantryNames = pantryItems.map((item) => item.ingredient);
  const minMatch = options?.minMatch ?? 0;
  const results = [];
  for (const recipe of recipes) {
    if (!recipe.ingredients || recipe.ingredients.length === 0) continue;
    if (options?.cuisine && options.cuisine !== "All" && recipe.cuisine.toLowerCase() !== options.cuisine.toLowerCase()) {
      continue;
    }
    if (options?.dietaryType && options.dietaryType !== "All" && recipe.dietaryType !== options.dietaryType) {
      continue;
    }
    const matchedIngredients = [];
    const missingIngredients = [];
    for (const ing of recipe.ingredients) {
      if (isIngredientMatched(ing.name, pantryNames)) {
        matchedIngredients.push(ing.name);
      } else {
        missingIngredients.push({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          aisle: ing.aisle || "Pantry"
        });
      }
    }
    const total = recipe.ingredients.length;
    const matchedCount = matchedIngredients.length;
    const matchPercentage = Math.round(matchedCount / total * 100);
    if (matchPercentage >= minMatch) {
      results.push({
        recipe,
        recipeId: recipe._id ? recipe._id.toString() : "",
        title: recipe.title,
        image: recipe.image,
        cuisine: recipe.cuisine,
        category: recipe.category,
        difficulty: recipe.difficulty,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        matchPercentage,
        matchedIngredients,
        missingIngredients,
        totalIngredients: total,
        matchedCount,
        missingCount: missingIngredients.length
      });
    }
  }
  const sortBy = options?.sortBy || "highestMatch";
  results.sort((a, b) => {
    if (sortBy === "lowestMissing") {
      if (a.missingCount !== b.missingCount) {
        return a.missingCount - b.missingCount;
      }
      return b.matchPercentage - a.matchPercentage;
    } else if (sortBy === "quickest") {
      return a.cookTime + a.prepTime - (b.cookTime + b.prepTime);
    } else if (sortBy === "alphabetical") {
      return a.title.localeCompare(b.title);
    }
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    return a.missingCount - b.missingCount;
  });
  return results;
}

// server/controllers/recipeController.ts
async function getRecipes(req, res) {
  try {
    const {
      search,
      cuisine,
      category,
      dietaryType,
      difficulty,
      maxCookTime,
      tag,
      page = 1,
      limit = 12,
      sortBy = "newest"
    } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
    const query = {};
    if (search && typeof search === "string" && search.trim() !== "") {
      const q = search.trim();
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { cuisine: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
        { "ingredients.name": { $regex: q, $options: "i" } }
      ];
    }
    if (tag && typeof tag === "string" && tag.trim() !== "" && tag !== "All") {
      const tQuery = tag.trim();
      query.tags = { $regex: tQuery, $options: "i" };
    }
    if (cuisine && cuisine !== "All") {
      query.cuisine = { $regex: new RegExp(`^${cuisine}$`, "i") };
    }
    if (category && category !== "All") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }
    if (dietaryType && dietaryType !== "All") {
      query.dietaryType = dietaryType;
    }
    if (difficulty && difficulty !== "All") {
      query.difficulty = difficulty;
    }
    if (maxCookTime) {
      const maxMins = parseInt(maxCookTime, 10);
      if (!isNaN(maxMins)) {
        query.$expr = { $lte: [{ $add: ["$prepTime", "$cookTime"] }, maxMins] };
      }
    }
    let sortOption = { createdAt: -1 };
    if (sortBy === "quickest") {
      sortOption = { cookTime: 1, prepTime: 1 };
    } else if (sortBy === "alphabetical") {
      sortOption = { title: 1 };
    }
    const total = await RecipeModel.countDocuments(query);
    const pages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = await RecipeModel.find(query).sort(sortOption).skip(startIndex).limit(limitNum);
    return res.status(200).json({
      success: true,
      data: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function getRecipeById(req, res) {
  try {
    const { id } = req.params;
    const recipe = await RecipeModel.findById(id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found."
      });
    }
    let pantryMatch = null;
    if (req.user?._id) {
      const userPantry = await PantryItemModel.find({ userId: req.user._id });
      const pantryNames = userPantry.map((p) => p.ingredient);
      const matched = [];
      const missing = [];
      for (const ing of recipe.ingredients || []) {
        if (isIngredientMatched(ing.name, pantryNames)) {
          matched.push(ing.name);
        } else {
          missing.push(ing);
        }
      }
      const total = recipe.ingredients?.length || 1;
      const percentage = Math.round(matched.length / total * 100);
      pantryMatch = {
        percentage,
        matched,
        missing,
        totalIngredients: total
      };
    }
    const recipeDoc = typeof recipe.toObject === "function" ? recipe.toObject() : recipe;
    return res.status(200).json({
      success: true,
      data: {
        ...recipeDoc,
        pantryMatch
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function createRecipe(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const {
      title,
      description,
      image,
      ingredients,
      instructions,
      cuisine,
      category,
      difficulty,
      prepTime,
      cookTime,
      servings,
      tags,
      dietaryType,
      calories
    } = req.body;
    if (!title || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Recipe title and at least one ingredient are required."
      });
    }
    if (!instructions || !Array.isArray(instructions) || instructions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Recipe instructions must have at least one step."
      });
    }
    const newRecipe = await RecipeModel.create({
      title: title.trim(),
      description: description?.trim() || "",
      image: image || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&auto=format&fit=crop",
      author: req.user._id.toString(),
      authorName: req.user.name,
      ingredients: ingredients.map((i) => ({
        name: i.name.trim(),
        quantity: i.quantity || 1,
        unit: i.unit || "unit",
        aisle: i.aisle || "Pantry"
      })),
      instructions: instructions.map((s) => s.trim()).filter(Boolean),
      cuisine: cuisine || "International",
      category: category || "Dinner",
      difficulty: difficulty || "Medium",
      prepTime: Number(prepTime) || 15,
      cookTime: Number(cookTime) || 20,
      servings: Number(servings) || 4,
      tags: sanitizeRecipeTags(tags),
      dietaryType: dietaryType || "Any",
      calories: Number(calories) || void 0
    });
    return res.status(201).json({
      success: true,
      message: "Recipe created successfully!",
      data: newRecipe
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function updateRecipe(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const { id } = req.params;
    const existing = await RecipeModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Recipe not found." });
    }
    if (existing.author !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only edit recipes that you authored."
      });
    }
    const updateData = { ...req.body };
    if (updateData.tags !== void 0) {
      updateData.tags = sanitizeRecipeTags(updateData.tags);
    }
    const updated = await RecipeModel.findByIdAndUpdate(id, updateData, { new: true });
    return res.status(200).json({
      success: true,
      message: "Recipe updated successfully.",
      data: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function getAllTags(req, res) {
  try {
    const tagCounts = await RecipeModel.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $match: { _id: { $ne: "" } } },
      { $sort: { count: -1, _id: 1 } }
    ]);
    const sortedTags = tagCounts.map((t) => t._id);
    const tagCountMap = {};
    tagCounts.forEach((t) => {
      tagCountMap[t._id] = t.count;
    });
    return res.status(200).json({
      success: true,
      data: sortedTags,
      counts: tagCountMap
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function deleteRecipe(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const { id } = req.params;
    const existing = await RecipeModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Recipe not found." });
    }
    if (existing.author !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only delete recipes that you authored."
      });
    }
    await RecipeModel.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Recipe deleted successfully."
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function getMyRecipes(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const myRecipes = await RecipeModel.find({ author: req.user._id.toString() }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: myRecipes
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// server/routes/recipeRoutes.ts
var router2 = Router2();
router2.get("/", getRecipes);
router2.get("/tags", getAllTags);
router2.get("/my-recipes", authenticateToken, getMyRecipes);
router2.get("/:id", optionalAuth, getRecipeById);
router2.post("/", authenticateToken, createRecipe);
router2.put("/:id", authenticateToken, updateRecipe);
router2.delete("/:id", authenticateToken, deleteRecipe);
var recipeRoutes_default = router2;

// server/routes/pantryRoutes.ts
import { Router as Router3 } from "express";

// server/controllers/pantryController.ts
async function getPantry(req, res) {
  try {
    if (!req.user?._id) return res.status(401).json({ success: false, message: "Unauthenticated." });
    const { search, category, sort } = req.query;
    const query = { userId: req.user._id };
    if (search && typeof search === "string" && search.trim() !== "") {
      query.ingredient = { $regex: search.trim(), $options: "i" };
    }
    if (category && category !== "All") {
      query.category = category;
    }
    let sortOption = { expiryDate: 1, createdAt: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };
    const items = await PantryItemModel.find(query).sort(sortOption);
    return res.status(200).json({
      success: true,
      data: items,
      totalCount: items.length
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function addPantryItem(req, res) {
  try {
    if (!req.user?._id) return res.status(401).json({ success: false, message: "Unauthenticated." });
    const { ingredient, quantity, unit, category, expiryDate } = req.body;
    if (!ingredient || !ingredient.trim()) {
      return res.status(400).json({
        success: false,
        message: "Ingredient name is required."
      });
    }
    const existing = await PantryItemModel.findOne({
      userId: req.user._id,
      ingredient: { $regex: new RegExp(`^${ingredient.trim()}$`, "i") }
    });
    if (existing) {
      const updated = await PantryItemModel.findByIdAndUpdate(existing._id, {
        quantity: quantity || existing.quantity,
        unit: unit || existing.unit,
        category: category || existing.category,
        expiryDate: expiryDate || existing.expiryDate
      }, { new: true });
      return res.status(200).json({
        success: true,
        message: `${ingredient} updated in your pantry.`,
        data: updated
      });
    }
    const newItem = await PantryItemModel.create({
      userId: req.user._id,
      ingredient: ingredient.trim(),
      quantity: quantity || 1,
      unit: unit || "item",
      category: category || autoCategorize(ingredient.trim()),
      expiryDate: expiryDate || void 0
    });
    return res.status(201).json({
      success: true,
      message: `${ingredient} added to your pantry.`,
      data: newItem
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function updatePantryItem(req, res) {
  try {
    if (!req.user?._id) return res.status(401).json({ success: false, message: "Unauthenticated." });
    const { id } = req.params;
    const existing = await PantryItemModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Pantry item not found." });
    }
    if (existing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }
    const updated = await PantryItemModel.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json({
      success: true,
      message: "Pantry item updated.",
      data: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function deletePantryItem(req, res) {
  try {
    if (!req.user?._id) return res.status(401).json({ success: false, message: "Unauthenticated." });
    const { id } = req.params;
    const existing = await PantryItemModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Pantry item not found." });
    }
    if (existing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }
    await PantryItemModel.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Pantry item removed."
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function quickAddPantryItems(req, res) {
  try {
    if (!req.user?._id) return res.status(401).json({ success: false, message: "Unauthenticated." });
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Items array is required." });
    }
    const createdList = [];
    for (const item of items) {
      const name = typeof item === "string" ? item : item.name || item.ingredient;
      if (!name) continue;
      const created = await PantryItemModel.create({
        userId: req.user._id,
        ingredient: name.trim(),
        quantity: item.quantity || 1,
        unit: item.unit || "unit",
        category: item.category || autoCategorize(name.trim()),
        expiryDate: item.expiryDate || void 0
      });
      createdList.push(created);
    }
    return res.status(201).json({
      success: true,
      message: `Added ${createdList.length} items to pantry.`,
      data: createdList
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
function autoCategorize(name) {
  const lower = name.toLowerCase();
  if (lower.includes("garlic") || lower.includes("onion") || lower.includes("tomato") || lower.includes("potato") || lower.includes("avocado") || lower.includes("lemon") || lower.includes("cucumber") || lower.includes("spinach") || lower.includes("herb") || lower.includes("basil")) return "Produce";
  if (lower.includes("milk") || lower.includes("cheese") || lower.includes("butter") || lower.includes("cream") || lower.includes("egg") || lower.includes("yogurt") || lower.includes("paneer")) return "Dairy";
  if (lower.includes("chicken") || lower.includes("beef") || lower.includes("pork") || lower.includes("bacon") || lower.includes("turkey")) return "Meat";
  if (lower.includes("salmon") || lower.includes("fish") || lower.includes("shrimp") || lower.includes("tuna") || lower.includes("prawn")) return "Seafood";
  if (lower.includes("bread") || lower.includes("toast") || lower.includes("bun") || lower.includes("sourdough")) return "Bakery";
  return "Pantry";
}

// server/routes/pantryRoutes.ts
var router3 = Router3();
router3.use(authenticateToken);
router3.get("/", getPantry);
router3.post("/", addPantryItem);
router3.post("/quick-add", quickAddPantryItems);
router3.put("/:id", updatePantryItem);
router3.delete("/:id", deletePantryItem);
var pantryRoutes_default = router3;

// server/routes/matchingRoutes.ts
import { Router as Router4 } from "express";

// server/controllers/matchingController.ts
async function getPantryMatches(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const { minMatch = 0, sortBy = "highestMatch", cuisine, dietaryType } = req.query;
    const userPantry = await PantryItemModel.find({ userId: req.user._id });
    const allRecipes = await RecipeModel.find({});
    const minMatchNum = parseInt(minMatch, 10) || 0;
    const matches = computeRecipeMatches(allRecipes, userPantry, {
      minMatch: minMatchNum,
      sortBy,
      cuisine,
      dietaryType
    });
    return res.status(200).json({
      success: true,
      data: {
        matches,
        pantryItemsCount: userPantry.length,
        pantrySummary: userPantry.map((p) => p.ingredient),
        totalMatches: matches.length,
        highMatchCount: matches.filter((m) => m.matchPercentage >= 75).length
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// server/routes/matchingRoutes.ts
var router4 = Router4();
router4.get("/", authenticateToken, getPantryMatches);
router4.get("/recipes", authenticateToken, getPantryMatches);
var matchingRoutes_default = router4;

// server/routes/shoppingRoutes.ts
import { Router as Router5 } from "express";

// server/models/ShoppingList.ts
import mongoose4, { Schema as Schema4 } from "mongoose";
var shoppingListSchema = new Schema4(
  {
    userId: { type: Schema4.Types.ObjectId, ref: "User", required: true },
    ingredient: { type: String, required: true },
    quantity: { type: Schema4.Types.Mixed, required: true },
    unit: { type: String, required: true },
    category: { type: String },
    checked: { type: Boolean, default: false },
    sourceRecipeId: { type: String },
    recipeOrigin: { type: String },
    estimatedPrice: { type: Number }
  },
  { timestamps: true }
);
var ShoppingListModel = mongoose4.model("ShoppingItem", shoppingListSchema);

// server/controllers/shoppingListController.ts
async function getShoppingList(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const items = await ShoppingListModel.find({ userId: req.user._id });
    const aisleGroups = {
      "Produce": [],
      "Dairy & Eggs": [],
      "Seafood & Meat": [],
      "Pantry & Spices": [],
      "Bakery": [],
      "Other": []
    };
    let totalEstimatedCost = 0;
    let completedCount = 0;
    for (const item of items) {
      if (item.checked) completedCount++;
      totalEstimatedCost += item.estimatedPrice || 2.5;
      const cat = (item.category || "").toLowerCase();
      if (cat.includes("produce") || cat.includes("veg") || cat.includes("fruit")) {
        aisleGroups["Produce"].push(item);
      } else if (cat.includes("dairy") || cat.includes("egg") || cat.includes("cheese")) {
        aisleGroups["Dairy & Eggs"].push(item);
      } else if (cat.includes("seafood") || cat.includes("meat") || cat.includes("fish")) {
        aisleGroups["Seafood & Meat"].push(item);
      } else if (cat.includes("bakery") || cat.includes("bread")) {
        aisleGroups["Bakery"].push(item);
      } else if (cat.includes("pantry") || cat.includes("spice") || cat.includes("grain")) {
        aisleGroups["Pantry & Spices"].push(item);
      } else {
        aisleGroups["Other"].push(item);
      }
    }
    return res.status(200).json({
      success: true,
      data: items,
      aisleGroups,
      summary: {
        totalItems: items.length,
        completedCount,
        pendingCount: items.length - completedCount,
        estimatedTotal: Number(totalEstimatedCost.toFixed(2))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function addShoppingItem(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const { ingredient, quantity, unit, category, estimatedPrice, recipeOrigin } = req.body;
    if (!ingredient || !ingredient.trim()) {
      return res.status(400).json({
        success: false,
        message: "Ingredient name is required."
      });
    }
    const newItem = await ShoppingListModel.create({
      userId: req.user._id,
      ingredient: ingredient.trim(),
      quantity: quantity || 1,
      unit: unit || "item",
      category: category || "Pantry",
      checked: false,
      recipeOrigin: recipeOrigin || "Manual Entry",
      estimatedPrice: estimatedPrice ? Number(estimatedPrice) : 2.5
    });
    return res.status(201).json({
      success: true,
      message: `${ingredient} added to shopping list.`,
      data: newItem
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function toggleShoppingItem(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const { id } = req.params;
    const existing = await ShoppingListModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }
    if (existing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }
    const updated = await ShoppingListModel.findByIdAndUpdate(id, {
      checked: !existing.checked
    }, { new: true });
    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function deleteShoppingItem(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const { id } = req.params;
    const existing = await ShoppingListModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }
    if (existing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }
    await ShoppingListModel.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Item removed from shopping list."
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function clearCompletedItems(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const all = await ShoppingListModel.find({ userId: req.user._id, checked: true });
    for (const item of all) {
      if (item._id) await ShoppingListModel.findByIdAndDelete(item._id);
    }
    return res.status(200).json({
      success: true,
      message: `Cleared ${all.length} completed items.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function addMissingIngredients(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const { ingredients, recipeTitle } = req.body;
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Ingredients array is required."
      });
    }
    const added = [];
    for (const ing of ingredients) {
      const name = typeof ing === "string" ? ing : ing.name;
      if (!name) continue;
      const created = await ShoppingListModel.create({
        userId: req.user._id,
        ingredient: name.trim(),
        quantity: ing.quantity || 1,
        unit: ing.unit || "item",
        category: ing.aisle || "Pantry",
        checked: false,
        recipeOrigin: recipeTitle || "Missing Ingredients",
        estimatedPrice: 2.5
      });
      added.push(created);
    }
    return res.status(201).json({
      success: true,
      message: `Added ${added.length} missing ingredients to your shopping list!`,
      data: added
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function autoStockToPantry(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const { itemIds, onlyChecked = false } = req.body;
    let itemsToStock = [];
    if (Array.isArray(itemIds) && itemIds.length > 0) {
      itemsToStock = await ShoppingListModel.find({ userId: req.user._id });
      itemsToStock = itemsToStock.filter((i) => itemIds.includes(i._id));
    } else if (onlyChecked) {
      itemsToStock = await ShoppingListModel.find({ userId: req.user._id, checked: true });
    } else {
      itemsToStock = await ShoppingListModel.find({ userId: req.user._id });
    }
    if (itemsToStock.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No shopping items selected for pantry auto-stocking."
      });
    }
    const stockedPantryItems = [];
    for (const shopItem of itemsToStock) {
      const existingPantry = await PantryItemModel.findOne({
        userId: req.user._id,
        ingredient: shopItem.ingredient
      });
      if (existingPantry) {
        const updated = await PantryItemModel.findByIdAndUpdate(existingPantry._id, {
          quantity: `${existingPantry.quantity} + ${shopItem.quantity}`,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }, { new: true });
        stockedPantryItems.push(updated);
      } else {
        const newPantry = await PantryItemModel.create({
          userId: req.user._id,
          ingredient: shopItem.ingredient,
          quantity: shopItem.quantity,
          unit: shopItem.unit,
          category: shopItem.category || "Pantry",
          expiryDate: new Date(Date.now() + 14 * 864e5).toISOString().split("T")[0]
          // Default 14-day expiry
        });
        stockedPantryItems.push(newPantry);
      }
      if (shopItem._id) {
        await ShoppingListModel.findByIdAndDelete(shopItem._id);
      }
    }
    return res.status(200).json({
      success: true,
      message: `Successfully transferred ${stockedPantryItems.length} items into your pantry!`,
      data: stockedPantryItems
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// server/routes/shoppingRoutes.ts
var router5 = Router5();
router5.use(authenticateToken);
router5.get("/", getShoppingList);
router5.post("/", addShoppingItem);
router5.post("/add-missing", addMissingIngredients);
router5.post("/auto-stock", autoStockToPantry);
router5.put("/:id/toggle", toggleShoppingItem);
router5.delete("/completed", clearCompletedItems);
router5.delete("/:id", deleteShoppingItem);
var shoppingRoutes_default = router5;

// server/routes/mealPlanRoutes.ts
import { Router as Router6 } from "express";

// server/models/MealPlan.ts
import mongoose5, { Schema as Schema5 } from "mongoose";
var mealPlanSchema = new Schema5(
  {
    userId: { type: Schema5.Types.ObjectId, ref: "User", required: true },
    recipeId: { type: String, required: true },
    recipeTitle: { type: String },
    recipeImage: { type: String },
    cookTime: { type: Number },
    date: { type: String, required: true },
    mealType: { type: String, enum: ["breakfast", "lunch", "dinner", "snack"], required: true },
    notes: { type: String },
    calories: { type: Number },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);
mealPlanSchema.index({ userId: 1, date: 1 });
var MealPlanModel = mongoose5.model("MealPlan", mealPlanSchema);

// server/controllers/mealPlanController.ts
async function getWeeklyPlan(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const { startDate, endDate } = req.query;
    const query = { userId: req.user._id };
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    const meals = await MealPlanModel.find(query).sort({ date: 1 });
    return res.status(200).json({
      success: true,
      data: meals,
      totalCount: meals.length
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function addMeal(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const { recipeId, date, mealType, notes } = req.body;
    if (!recipeId || !date || !mealType) {
      return res.status(400).json({
        success: false,
        message: "Recipe, date (YYYY-MM-DD), and mealType are required."
      });
    }
    const recipe = await RecipeModel.findById(recipeId);
    const newMeal = await MealPlanModel.create({
      userId: req.user._id,
      recipeId,
      recipeTitle: recipe?.title || "Custom Meal",
      recipeImage: recipe?.image || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop",
      cookTime: recipe?.cookTime || 20,
      calories: recipe?.calories || 420,
      date,
      mealType,
      notes: notes || "",
      completed: false
    });
    return res.status(201).json({
      success: true,
      message: `Added ${newMeal.recipeTitle} to meal plan.`,
      data: newMeal
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function updateMeal(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const { id } = req.params;
    const existing = await MealPlanModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Meal plan entry not found." });
    }
    if (existing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }
    const updated = await MealPlanModel.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function deleteMeal(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const { id } = req.params;
    const existing = await MealPlanModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Meal entry not found." });
    }
    if (existing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }
    await MealPlanModel.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Meal removed from planner."
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function getTodayMeals(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const meals = await MealPlanModel.find({
      userId: req.user._id,
      date: todayStr
    });
    return res.status(200).json({
      success: true,
      data: meals
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// server/routes/mealPlanRoutes.ts
var router6 = Router6();
router6.use(authenticateToken);
router6.get("/weekly", getWeeklyPlan);
router6.get("/today", getTodayMeals);
router6.post("/", addMeal);
router6.put("/:id", updateMeal);
router6.delete("/:id", deleteMeal);
var mealPlanRoutes_default = router6;

// server/routes/favoriteRoutes.ts
import { Router as Router7 } from "express";

// server/models/Favorite.ts
import mongoose6, { Schema as Schema6 } from "mongoose";
var favoriteSchema = new Schema6(
  {
    userId: { type: Schema6.Types.ObjectId, ref: "User", required: true },
    recipeId: { type: String, required: true }
  },
  { timestamps: true }
);
favoriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true });
var FavoriteModel = mongoose6.model("Favorite", favoriteSchema);

// server/controllers/favoriteController.ts
async function toggleFavorite(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const { recipeId } = req.body;
    if (!recipeId) {
      return res.status(400).json({ success: false, message: "Recipe ID is required." });
    }
    const existing = await FavoriteModel.findOne({
      userId: req.user._id,
      recipeId
    });
    if (existing) {
      await FavoriteModel.findByIdAndDelete(existing._id);
      return res.status(200).json({
        success: true,
        isFavorited: false,
        message: "Removed from favorites."
      });
    } else {
      await FavoriteModel.create({
        userId: req.user._id,
        recipeId
      });
      return res.status(200).json({
        success: true,
        isFavorited: true,
        message: "Saved to favorites!"
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function getFavorites(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const favs = await FavoriteModel.find({ userId: req.user._id });
    const recipeIds = favs.map((f) => f.recipeId);
    const recipes = await RecipeModel.find({ _id: { $in: recipeIds } });
    return res.status(200).json({
      success: true,
      data: recipes,
      totalCount: recipes.length,
      favoriteIds: recipeIds
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// server/routes/favoriteRoutes.ts
var router7 = Router7();
router7.use(authenticateToken);
router7.get("/", getFavorites);
router7.post("/toggle", toggleFavorite);
var favoriteRoutes_default = router7;

// server/routes/externalRoutes.ts
import { Router as Router8 } from "express";

// server/services/externalRecipeService.ts
import axios from "axios";
var MEALDB_BASE_URL = process.env.MEALDB_API_URL || "https://www.themealdb.com/api/json/v1/1";
var ExternalRecipeService = class {
  /**
   * Search recipes from TheMealDB by query term.
   */
  static async searchRecipes(query = "chicken") {
    try {
      const response = await axios.get(`${MEALDB_BASE_URL}/search.php?s=${encodeURIComponent(query)}`, {
        timeout: 5e3
      });
      if (!response.data || !response.data.meals) {
        return [];
      }
      return response.data.meals.map((meal) => this.normalizeMeal(meal));
    } catch (error) {
      console.warn("TheMealDB search error or timeout:", error.message);
      return [];
    }
  }
  /**
   * Lookup recipe by TheMealDB ID.
   */
  static async getRecipeById(id) {
    try {
      const response = await axios.get(`${MEALDB_BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`, {
        timeout: 5e3
      });
      if (!response.data || !response.data.meals || response.data.meals.length === 0) {
        return null;
      }
      return this.normalizeMeal(response.data.meals[0]);
    } catch (error) {
      console.warn("TheMealDB lookup error:", error.message);
      return null;
    }
  }
  /**
   * Fetch random inspirational meal.
   */
  static async getRandomRecipe() {
    try {
      const response = await axios.get(`${MEALDB_BASE_URL}/random.php`, {
        timeout: 5e3
      });
      if (!response.data || !response.data.meals || response.data.meals.length === 0) {
        return null;
      }
      return this.normalizeMeal(response.data.meals[0]);
    } catch (error) {
      console.warn("TheMealDB random meal error:", error.message);
      return null;
    }
  }
  /**
   * Normalize TheMealDB structure (strIngredient1..20 and strMeasure1..20) into RecipeMaster format.
   */
  static normalizeMeal(meal) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingName = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingName && ingName.trim() !== "") {
        const parsedMeasure = (measure || "").trim();
        let qty = 1;
        let unit = "piece";
        const match = parsedMeasure.match(/^([\d\s\/\.\-]+)\s*(.*)$/);
        if (match) {
          qty = match[1].trim() || 1;
          unit = match[2].trim() || "unit";
        } else if (parsedMeasure) {
          unit = parsedMeasure;
        }
        ingredients.push({
          name: ingName.trim(),
          quantity: qty,
          unit: unit || "item",
          aisle: this.categorizeIngredient(ingName)
        });
      }
    }
    const rawInstructions = meal.strInstructions || "";
    const instructions = rawInstructions.split(/\r?\n+/).map((s) => s.trim()).filter((s) => s.length > 5 && !s.toLowerCase().startsWith("step"));
    return {
      _id: `ext_${meal.idMeal}`,
      title: meal.strMeal,
      description: `Authentic ${meal.strArea || "International"} ${meal.strCategory || "dish"} curated from TheMealDB culinary archives.`,
      image: meal.strMealThumb || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop",
      author: "external_themealdb",
      authorName: "Global Culinary DB",
      ingredients,
      instructions: instructions.length > 0 ? instructions : [rawInstructions],
      cuisine: meal.strArea || "International",
      category: meal.strCategory || "Dinner",
      difficulty: ingredients.length > 8 ? "Medium" : "Easy",
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      tags: [meal.strCategory, meal.strArea, "International"].filter(Boolean),
      dietaryType: meal.strCategory === "Vegetarian" ? "Vegetarian" : meal.strCategory === "Vegan" ? "Vegan" : "Non-Vegetarian",
      isExternal: true,
      externalSourceUrl: meal.strSource || meal.strYoutube
    };
  }
  static categorizeIngredient(name) {
    const lower = name.toLowerCase();
    if (lower.includes("garlic") || lower.includes("onion") || lower.includes("tomato") || lower.includes("herb") || lower.includes("lemon") || lower.includes("potato") || lower.includes("spinach")) return "Produce";
    if (lower.includes("milk") || lower.includes("butter") || lower.includes("cream") || lower.includes("cheese") || lower.includes("yogurt")) return "Dairy";
    if (lower.includes("salmon") || lower.includes("tuna") || lower.includes("prawn") || lower.includes("shrimp") || lower.includes("fish")) return "Seafood";
    if (lower.includes("chicken") || lower.includes("beef") || lower.includes("pork") || lower.includes("lamb") || lower.includes("bacon")) return "Meat";
    if (lower.includes("oil") || lower.includes("sauce") || lower.includes("rice") || lower.includes("pasta") || lower.includes("flour") || lower.includes("sugar") || lower.includes("salt") || lower.includes("pepper")) return "Pantry";
    return "Pantry";
  }
};

// server/controllers/externalRecipeController.ts
async function searchExternalRecipes(req, res) {
  try {
    const { q = "pasta" } = req.query;
    const meals = await ExternalRecipeService.searchRecipes(q);
    return res.status(200).json({
      success: true,
      data: meals,
      count: meals.length
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function getExternalRecipeById(req, res) {
  try {
    const { id } = req.params;
    const meal = await ExternalRecipeService.getRecipeById(id);
    if (!meal) {
      return res.status(404).json({ success: false, message: "External recipe not found." });
    }
    return res.status(200).json({
      success: true,
      data: meal
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function getRandomExternalRecipe(req, res) {
  try {
    const meal = await ExternalRecipeService.getRandomRecipe();
    if (!meal) {
      return res.status(404).json({ success: false, message: "Could not fetch inspiration recipe." });
    }
    return res.status(200).json({
      success: true,
      data: meal
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function importExternalRecipe(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthenticated." });
    }
    const { recipeId } = req.body;
    let meal = null;
    if (recipeId.startsWith("ext_")) {
      const cleanId = recipeId.replace("ext_", "");
      meal = await ExternalRecipeService.getRecipeById(cleanId);
    } else {
      meal = await ExternalRecipeService.getRecipeById(recipeId);
    }
    if (!meal) {
      return res.status(404).json({ success: false, message: "External recipe could not be found to import." });
    }
    const imported = await RecipeModel.create({
      ...meal,
      _id: void 0,
      // Create fresh ID
      author: req.user._id.toString(),
      authorName: req.user.name,
      title: `${meal.title} (Imported)`,
      isExternal: false
    });
    return res.status(201).json({
      success: true,
      message: `"${meal.title}" imported to your Recipe Studio!`,
      data: imported
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// server/routes/externalRoutes.ts
var router8 = Router8();
router8.get("/search", searchExternalRecipes);
router8.get("/random", getRandomExternalRecipe);
router8.get("/:id", getExternalRecipeById);
router8.post("/import", authenticateToken, importExternalRecipe);
var externalRoutes_default = router8;

// server/routes/aiRoutes.ts
import { Router as Router9 } from "express";

// server/controllers/aiController.ts
import { GoogleGenAI } from "@google/genai";
async function culinaryAdvisor(req, res) {
  try {
    const { prompt, recipeTitle, currentIngredients, requestedSubstitute } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: true,
        data: {
          answer: `For ${requestedSubstitute || "missing ingredients"}, you can substitute with common pantry items like nutritional yeast for cheese, flaxseed egg for eggs, or lemon juice for vinegar.`,
          groundingSources: []
        }
      });
    }
    const ai = new GoogleGenAI();
    const query = prompt || `In the recipe "${recipeTitle || "Dish"}", what are the best culinary substitutes for "${requestedSubstitute}" considering flavour profile and cooking chemistry? Provide 3 specific alternatives with exact ratios and brief chef tips.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7
      }
    });
    const text = response.text || "No advice generated.";
    const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchWebSources = searchChunks.map((c) => c.web?.uri ? { title: c.web.title, uri: c.web.uri } : null).filter(Boolean);
    return res.status(200).json({
      success: true,
      data: {
        answer: text,
        groundingSources: searchWebSources
      }
    });
  } catch (error) {
    console.error("Gemini search grounding error:", error);
    return res.status(200).json({
      success: true,
      data: {
        answer: "Chef tip: You can substitute dairy butter with olive oil or ghee in equal measures. For missing aromatics, onion powder or chives make excellent substitutes.",
        groundingSources: []
      }
    });
  }
}

// server/routes/aiRoutes.ts
var router9 = Router9();
router9.post("/culinary-advisor", culinaryAdvisor);
var aiRoutes_default = router9;

// server/app.ts
function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({
    origin: process.env.NODE_ENV === "production" ? ["https://your-production-url.com"] : "http://localhost:5173",
    credentials: true
  }));
  app.use(express.json());
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 100,
    // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." }
  });
  app.use("/api", apiLimiter);
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      app: "RecipeMaster",
      version: "1.0.0",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.use("/api/auth", authRoutes_default);
  app.use("/api/recipes", recipeRoutes_default);
  app.use("/api/pantry", pantryRoutes_default);
  app.use("/api/matching", matchingRoutes_default);
  app.use("/api/shopping-list", shoppingRoutes_default);
  app.use("/api/meal-plans", mealPlanRoutes_default);
  app.use("/api/favorites", favoriteRoutes_default);
  app.use("/api/external-recipes", externalRoutes_default);
  app.use("/api/ai", aiRoutes_default);
  app.use(errorHandler);
  return app;
}

// server/config/db.ts
import mongoose7 from "mongoose";
var connectDB = async () => {
  try {
    const conn = await mongoose7.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function startServer() {
  await connectDB();
  const app = createApp();
  const PORT = Number(process.env.PORT) || 3e3;
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true"
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express2.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F373} RecipeMaster MERN server running at http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});
