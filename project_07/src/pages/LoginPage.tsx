import React, { useState } from 'react';
import { UtensilsCrossed, ArrowRight, Lock, Mail, Sparkles, ChefHat } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      showToast('Welcome back to RecipeMaster!', 'success');
      onNavigate('dashboard');
    } else {
      showToast(res.message || 'Login failed. Please check your credentials.', 'error');
    }
  };



  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      
      {/* Brand Icon */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#003629] text-white flex items-center justify-center mx-auto shadow-md shadow-[#003629]/20">
          <UtensilsCrossed className="w-6 h-6 text-emerald-300" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          Welcome to RecipeMaster
        </h1>
        <p className="text-xs text-stone-500">
          Sign in to access your synchronized pantry inventory and meal schedule.
        </p>
      </div>



      {/* Login Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-[#003629]"
              placeholder="chef@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-[#003629]"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-[#003629] text-white font-bold text-xs hover:bg-[#1b4d3e] shadow-md shadow-[#003629]/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? 'Signing In...' : 'Sign In to Account'}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="text-center text-xs text-stone-500">
        <span>Don't have an account yet? </span>
        <button
          onClick={() => onNavigate('register')}
          className="font-bold text-[#003629] hover:underline"
        >
          Create one for free
        </button>
      </div>

    </div>
  );
};
