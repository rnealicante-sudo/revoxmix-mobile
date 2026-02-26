
import { RadioStation } from '../types';

const FAVORITES_KEY = 'revoxmix_favorites';

export interface FavoriteStation extends RadioStation {
  customName?: string;
  category?: string;
}

export const favoritesService = {
  getFavorites: (): FavoriteStation[] => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse favorites', e);
      return [];
    }
  },

  saveFavorites: (favorites: FavoriteStation[]) => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  },

  addFavorite: (station: RadioStation) => {
    const favorites = favoritesService.getFavorites();
    if (favorites.find(f => f.id === station.id)) return;
    favorites.push({ ...station });
    favoritesService.saveFavorites(favorites);
  },

  removeFavorite: (stationId: string) => {
    const favorites = favoritesService.getFavorites();
    const updated = favorites.filter(f => f.id !== stationId);
    favoritesService.saveFavorites(updated);
  },

  updateFavorite: (stationId: string, updates: Partial<FavoriteStation>) => {
    const favorites = favoritesService.getFavorites();
    const index = favorites.findIndex(f => f.id === stationId);
    if (index === -1) return;
    favorites[index] = { ...favorites[index], ...updates };
    favoritesService.saveFavorites(favorites);
  },

  isFavorite: (stationId: string): boolean => {
    const favorites = favoritesService.getFavorites();
    return favorites.some(f => f.id === stationId);
  }
};
