import React from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PantryProvider } from './context/PantryContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { SmartMatchPage } from './pages/SmartMatchPage';
import { ExplorePage } from './pages/ExplorePage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { CreateRecipePage } from './pages/CreateRecipePage';
import { PantryPage } from './pages/PantryPage';
import { ShoppingListPage } from './pages/ShoppingListPage';
import { MealPlannerPage } from './pages/MealPlannerPage';
import { MyRecipesPage } from './pages/MyRecipesPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { DeliveryTrackingPage } from './pages/DeliveryTrackingPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003629]"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Route Parameter Wrappers (bridges existing prop dependencies)
const RecipeDetailWrapper = ({ onNavigate, onBack }: { onNavigate: any, onBack: any }) => {
  const { id } = useParams();
  if (!id) return <Navigate to="/explore" replace />;
  return <RecipeDetailPage recipeId={id} onNavigate={onNavigate} onBack={onBack} />;
};

const CreateRecipeWrapper = ({ onNavigate, onBack }: { onNavigate: any, onBack: any }) => {
  const { id } = useParams();
  return <CreateRecipePage recipeId={id} onNavigate={onNavigate} onBack={onBack} />;
};

const ExploreWrapper = ({ onNavigate }: { onNavigate: any }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tag = searchParams.get('tag') || undefined;
  return <ExplorePage onNavigate={onNavigate} initialTag={tag} />;
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (tab: string, recipeId?: string, tag?: string) => {
    if (tab === 'recipe-detail' && recipeId) return navigate(`/recipe/${recipeId}`);
    if (tab === 'edit-recipe' && recipeId) return navigate(`/edit-recipe/${recipeId}`);
    if (tab === 'landing') return navigate('/');
    if (tab === 'explore' && tag) return navigate(`/explore?tag=${tag}`);
    navigate(`/${tab}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Derive currentTab for Navbar styling
  const path = location.pathname;
  let currentTab = path.substring(1) || 'landing';
  if (path.startsWith('/recipe/')) currentTab = 'recipe-detail';
  if (path.startsWith('/edit-recipe/')) currentTab = 'edit-recipe';

  return (
    <div className="min-h-screen flex flex-col bg-[#f6fbf5] text-stone-800 antialiased font-sans selection:bg-[#003629] selection:text-white">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage onNavigate={handleNavigate} />} />
          <Route path="/landing" element={<Navigate to="/" replace />} />
          <Route path="/explore" element={<ExploreWrapper onNavigate={handleNavigate} />} />
          <Route path="/recipe/:id" element={<RecipeDetailWrapper onNavigate={handleNavigate} onBack={handleBack} />} />
          <Route path="/login" element={<LoginPage onNavigate={handleNavigate} />} />
          <Route path="/register" element={<RegisterPage onNavigate={handleNavigate} />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage onNavigate={handleNavigate} /></ProtectedRoute>} />
          <Route path="/smart-match" element={<ProtectedRoute><SmartMatchPage onNavigate={handleNavigate} /></ProtectedRoute>} />
          <Route path="/create-recipe" element={<ProtectedRoute><CreateRecipeWrapper onNavigate={handleNavigate} onBack={handleBack} /></ProtectedRoute>} />
          <Route path="/edit-recipe/:id" element={<ProtectedRoute><CreateRecipeWrapper onNavigate={handleNavigate} onBack={handleBack} /></ProtectedRoute>} />
          
          <Route path="/pantry" element={<ProtectedRoute><PantryPage onNavigate={handleNavigate} /></ProtectedRoute>} />
          <Route path="/shopping-list" element={<ProtectedRoute><ShoppingListPage onNavigate={handleNavigate} /></ProtectedRoute>} />
          <Route path="/meal-planner" element={<ProtectedRoute><MealPlannerPage onNavigate={handleNavigate} /></ProtectedRoute>} />
          <Route path="/my-recipes" element={<ProtectedRoute><MyRecipesPage onNavigate={handleNavigate} /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><FavoritesPage onNavigate={handleNavigate} /></ProtectedRoute>} />
          <Route path="/delivery-tracking" element={<ProtectedRoute><DeliveryTrackingPage onNavigate={handleNavigate} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage onNavigate={handleNavigate} /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <PantryProvider>
          <AppContent />
        </PantryProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
