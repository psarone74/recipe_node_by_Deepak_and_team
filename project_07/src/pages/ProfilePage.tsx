import React, { useState } from 'react';
import { User, ShieldCheck, Heart, Save, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

interface ProfilePageProps {
  onNavigate: (tab: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(
    user?.dietaryPreferences || ['Vegetarian']
  );

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const availableDiets = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Nut-Free',
    'Keto',
    'Low-Sodium',
    'Halal',
    'Kosher',
  ];

  const handleDietToggle = (diet: string) => {
    if (dietaryPreferences.includes(diet)) {
      setDietaryPreferences(dietaryPreferences.filter((d) => d !== diet));
    } else {
      setDietaryPreferences([...dietaryPreferences, diet]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      const res = await api.put('/auth/profile', {
        name,
        profileImage,
        dietaryPreferences,
      });
      if (res.data?.success) {
        updateUser(res.data.data);
        showToast('Profile and dietary preferences updated!', 'success');
      }
    } catch (err: any) {
      showToast('Error updating profile', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    try {
      setIsUpdatingPassword(true);
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.data?.success) {
        showToast('Password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error updating password', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-stone-200">
        <span className="text-xs font-bold uppercase tracking-wider text-[#a23e18] font-mono">
          Account & Dietary Preferences
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#003629] tracking-tight mt-1">
          Chef Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Customize your nutritional boundaries to auto-filter matching recipes across the ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Form: Profile & Diet */}
        <div className="md:col-span-7 space-y-6">
          <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">
              Profile Information
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#003629]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || 'roshaningershalvr@gmail.com'}
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-500 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Profile Avatar URL</label>
              <input
                type="url"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#003629]"
              />
            </div>

            {/* Dietary Preference Pills */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Dietary Preferences & Allergens
              </label>
              <div className="flex flex-wrap gap-2">
                {availableDiets.map((diet) => {
                  const isSelected = dietaryPreferences.includes(diet);
                  return (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => handleDietToggle(diet)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#003629] text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{diet}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#003629] text-white text-xs font-bold hover:bg-[#1b4d3e] shadow-xs disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-emerald-300" />
                <span>{isUpdatingProfile ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Form: Password Security */}
        <div className="md:col-span-5 space-y-6">
          <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">
                Security & Password
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full py-2.5 rounded-xl border border-stone-300 text-stone-800 text-xs font-bold hover:bg-stone-50 disabled:opacity-50"
              >
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>

          {/* Academic Assessment Note */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-2">
            <span className="font-bold text-stone-900 block font-mono">
              Database Credentials Note:
            </span>
            <p className="text-[11px] leading-relaxed">
              Passwords are salted and hashed using <strong>bcryptjs (salt rounds: 10)</strong> on the Node.js backend. User tokens are signed with <strong>jsonwebtoken (JWT)</strong> for stateless REST authorization.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
