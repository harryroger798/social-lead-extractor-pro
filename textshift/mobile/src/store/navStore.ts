import { create } from 'zustand';

interface NavStore {
  humanizerText: string | null;
  setHumanizerText: (text: string | null) => void;
}

export const useNavStore = create<NavStore>((set) => ({
  humanizerText: null,
  setHumanizerText: (text) => set({ humanizerText: text }),
}));
