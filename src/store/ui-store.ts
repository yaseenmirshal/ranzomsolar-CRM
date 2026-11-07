"use client";
import { create } from "zustand";
import { storage } from "@/services/storage";

interface UiState {
  collapsed: boolean;
  mobileOpen: boolean;
  loadedPrefs: boolean;
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
  loadPrefs: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  collapsed: false,
  mobileOpen: false,
  loadedPrefs: false,
  toggleCollapsed() {
    const next = !get().collapsed;
    storage.write("ui.collapsed", next);
    set({ collapsed: next });
  },
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
  loadPrefs() {
    if (get().loadedPrefs) return;
    set({ collapsed: storage.read<boolean>("ui.collapsed") ?? false, loadedPrefs: true });
  },
}));
