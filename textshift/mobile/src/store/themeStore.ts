import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, ThemeColors } from '../theme/colors';

type ThemeMode = 'dark' | 'light';

interface ThemeState {
  mode: ThemeMode;
  theme: ThemeColors;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'dark',
  theme: colors.dark,

  toggleTheme: () => {
    const next = get().mode === 'dark' ? 'light' : 'dark';
    set({ mode: next, theme: colors[next] });
    AsyncStorage.setItem('theme_mode', next);
  },

  loadTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem('theme_mode');
      if (stored === 'light' || stored === 'dark') {
        set({ mode: stored, theme: colors[stored] });
      }
    } catch {
      // ignore
    }
  },
}));
