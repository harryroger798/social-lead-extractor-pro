import { create } from 'zustand';

interface NavStore {
  humanizerText: string | null;
  detectorText: string | null;
  setHumanizerText: (text: string | null) => void;
  setDetectorText: (text: string | null) => void;
}

export const useNavStore = create<NavStore>((set) => ({
  humanizerText: null,
  detectorText: null,
  setHumanizerText: (text) => set({ humanizerText: text }),
  setDetectorText: (text) => set({ detectorText: text }),
}));
