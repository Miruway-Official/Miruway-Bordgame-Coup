import { create } from 'zustand';

interface UIStore {
  showRules: boolean;
  showGameLog: boolean;
  selectedCardId: string | null;
  selectedTargetId: string | null;
  animatingCardId: string | null;

  setShowRules: (v: boolean) => void;
  setShowGameLog: (v: boolean) => void;
  setSelectedCardId: (id: string | null) => void;
  setSelectedTargetId: (id: string | null) => void;
  setAnimatingCardId: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  showRules: false,
  showGameLog: true,
  selectedCardId: null,
  selectedTargetId: null,
  animatingCardId: null,

  setShowRules: (v) => set({ showRules: v }),
  setShowGameLog: (v) => set({ showGameLog: v }),
  setSelectedCardId: (id) => set({ selectedCardId: id }),
  setSelectedTargetId: (id) => set({ selectedTargetId: id }),
  setAnimatingCardId: (id) => set({ animatingCardId: id }),
}));
