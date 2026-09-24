import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { pantryService, IPantryItem } from '../services/pantryService';
import { useAuth } from './AuthContext';

interface PantryContextType {
  pantryItems: IPantryItem[];
  isLoading: boolean;
  itemCount: number;
  refreshPantry: () => Promise<void>;
  hasIngredient: (ingredientName: string) => boolean;
}

const PantryContext = createContext<PantryContextType | undefined>(undefined);

export const PantryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [pantryItems, setPantryItems] = useState<IPantryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshPantry = useCallback(async () => {
    if (!isAuthenticated) {
      setPantryItems([]);
      return;
    }
    try {
      setIsLoading(true);
      const res = await pantryService.getPantry();
      if (res?.data) {
        setPantryItems(res.data);
      }
    } catch (e) {
      console.warn('Failed to load pantry:', e);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshPantry();
  }, [refreshPantry]);

  const hasIngredient = (ingredientName: string): boolean => {
    const q = ingredientName.toLowerCase().trim();
    return pantryItems.some(p => p.ingredient.toLowerCase().includes(q) || q.includes(p.ingredient.toLowerCase()));
  };

  return (
    <PantryContext.Provider
      value={{
        pantryItems,
        isLoading,
        itemCount: pantryItems.length,
        refreshPantry,
        hasIngredient,
      }}
    >
      {children}
    </PantryContext.Provider>
  );
};

export const usePantry = () => {
  const context = useContext(PantryContext);
  if (!context) {
    throw new Error('usePantry must be used within a PantryProvider');
  }
  return context;
};
