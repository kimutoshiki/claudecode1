import { create } from "zustand";
import type { PlayerLayout } from "@/lib/types";

interface PlayerState {
  layout: PlayerLayout;
  showShortcuts: boolean;
  setLayout: (l: PlayerLayout) => void;
  toggleShortcuts: () => void;
  closeShortcuts: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  layout: "theater",
  showShortcuts: false,
  setLayout: (layout) => set({ layout }),
  toggleShortcuts: () => set((s) => ({ showShortcuts: !s.showShortcuts })),
  closeShortcuts: () => set({ showShortcuts: false }),
}));
