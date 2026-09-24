import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  Sparkles, 
  CalendarDays, 
  ShoppingCart, 
  Package2, 
  BookOpen, 
  PlusCircle, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Compass,
  Heart,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePantry } from '../../context/PantryContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount: pantryCount } = usePantry();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const currentTab = pathname.substring(1) || 'landing';

  const navLinks = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, authOnly: true },
    { id: 'smart-match', path: '/smart-match', label: 'Cook From Pantry', icon: Sparkles, badge: pantryCount > 0 ? `${pantryCount}` : undefined, highlight: true },
    { id: 'explore', path: '/explore', label: 'Explore', icon: Compass },
    { id: 'meal-planner', path: '/meal-planner', label: 'Meal Planner', icon: CalendarDays, authOnly: true },
    { id: 'shopping-list', path: '/shopping-list', label: 'Shopping List', icon: ShoppingCart, authOnly: true },
    { id: 'pantry', path: '/pantry', label: 'My Pantry', icon: Package2, authOnly: true },
    { id: 'my-recipes', path: '/my-recipes', label: 'My Recipes', icon: BookOpen, authOnly: true },
  ];

  const handleManualNav = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    handleManualNav('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#f6fbf5]/95 backdrop-blur-md border-b border-[#003629]/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link 
            to={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#003629] text-white flex items-center justify-center shadow-md shadow-[#003629]/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-[#003629] block leading-none">
                RecipeMaster
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#a23e18] block mt-0.5">
                Smart Pantry & Meals
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.authOnly && !isAuthenticated) return null;
              const Icon = link.icon;
              const isActive = currentTab === link.id;

              return (
                <Link
                  key={link.id}
                  to={link.path}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#003629] text-white shadow-sm'
                      : link.highlight
                      ? 'text-[#a23e18] hover:bg-[#a23e18]/10'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : link.highlight ? 'text-[#a23e18]' : 'text-stone-500'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#a23e18] text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/create-recipe"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#003629] text-white hover:bg-[#1b4d3e] shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-300" />
                  <span>New Recipe</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-200/50 transition-colors border border-stone-200"
                  >
                    <img
                      src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop'}
                      alt={user?.name || 'Chef'}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#003629]/20"
                    />
                    <span className="text-xs font-semibold text-stone-800 max-w-[100px] truncate">
                      {user?.name?.split(' ')[0] || 'Chef'}
                    </span>
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-stone-100">
                        <p className="text-xs font-bold text-stone-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => handleManualNav('/profile')}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-stone-500" />
                        <span>Profile & Diet</span>
                      </button>
                      <button
                        onClick={() => handleManualNav('/favorites')}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <span>Saved Recipes</span>
                      </button>
                      <button
                        onClick={() => handleManualNav('/settings')}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors"
                      >
                        <UtensilsCrossed className="w-3.5 h-3.5 text-stone-500" />
                        <span>MERN Tech Viva Specs</span>
                      </button>
                      <div className="border-t border-stone-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-200/60 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#003629] text-white hover:bg-[#1b4d3e] transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && (
              <Link
                to="/create-recipe"
                className="p-2 rounded-lg bg-[#003629] text-white"
                aria-label="Create Recipe"
              >
                <PlusCircle className="w-4 h-4" />
              </Link>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-stone-700 hover:bg-stone-200/60"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-stone-200 bg-white px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            if (link.authOnly && !isAuthenticated) return null;
            const Icon = link.icon;
            const isActive = currentTab === link.id;

            return (
              <Link
                key={link.id}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive
                    ? 'bg-[#003629] text-white'
                    : link.highlight
                    ? 'bg-[#a23e18]/10 text-[#a23e18]'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#a23e18] text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="border-t border-stone-200 pt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleManualNav('/profile')}
                  className="w-full text-left px-3.5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>Profile & Dietary Settings</span>
                </button>
                <button
                  onClick={() => handleManualNav('/favorites')}
                  className="w-full text-left px-3.5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Favorite Recipes</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3.5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold border border-stone-300 rounded-xl text-stone-700"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold bg-[#003629] text-white rounded-xl"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
