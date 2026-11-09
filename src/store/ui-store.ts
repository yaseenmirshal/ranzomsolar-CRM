"use client";
import { create } from "zustand";
import { storage } from "@/services/storage";

export const PALETTES = ["ocean", "violet", "emerald", "sunset"] as const;
export type Palette = (typeof PALETTES)[number];

interface UiState {
  collapsed: boolean;
  mobileOpen: boolean;
  loadedPrefs: boolean;
  palette: Palette;
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
  setPalette: (palette: Palette) => void;
  loadPrefs: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  collapsed: false,
  mobileOpen: false,
  loadedPrefs: false,
  palette: "ocean",
  toggleCollapsed() {
    const next = !get().collapsed;
    storage.write("ui.collapsed", next);
    set({ collapsed: next });
  },
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
  setPalette(palette) {
    storage.write("ui.palette", palette);
    document.documentElement.dataset.palette = palette;
    set({ palette });
  },
  loadPrefs() {
    if (get().loadedPrefs) return;
    const savedPalette = storage.read<Palette>("ui.palette");
    const palette = savedPalette && PALETTES.includes(savedPalette) ? savedPalette : "ocean";
    document.documentElement.dataset.palette = palette;
    set({ collapsed: storage.read<boolean>("ui.collapsed") ?? false, palette, loadedPrefs: true });
  },
}));
