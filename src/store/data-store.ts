"use client";

import { create } from "zustand";
import { buildSeed, TEAM, type SeedData } from "@/data/seed";
import { COLLECTION_KEYS, repositories, resetDemoData, type CollectionKey } from "@/services";

type Collections = { [K in CollectionKey]: SeedData[K] };
type ItemOf<K extends CollectionKey> = SeedData[K][number];

interface DataState extends Collections {
  team: typeof TEAM;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  add: <K extends CollectionKey>(key: K, item: ItemOf<K>) => Promise<void>;
  patch: <K extends CollectionKey>(key: K, id: string, patch: Partial<ItemOf<K>>) => Promise<void>;
  remove: (key: CollectionKey, id: string) => Promise<void>;
  reset: () => Promise<void>;
}

const empty = Object.fromEntries(COLLECTION_KEYS.map((k) => [k, []])) as unknown as Collections;

// Typed escape hatch: repositories are keyed per collection, the store treats them uniformly.
const repo = (key: CollectionKey) => repositories[key] as unknown as {
  list(): Promise<{ id: string }[]>;
  create(i: { id: string }): Promise<unknown>;
  update(id: string, p: object): Promise<unknown>;
  remove(id: string): Promise<void>;
};

export const useDataStore = create<DataState>((set, get) => ({
  ...empty,
  team: TEAM,
  hydrated: false,

  async hydrate() {
    if (get().hydrated) return;
    const entries = await Promise.all(COLLECTION_KEYS.map(async (k) => [k, await repo(k).list()] as const));
    set({ ...(Object.fromEntries(entries) as unknown as Collections), hydrated: true });
  },

  async add(key, item) {
    set({ [key]: [item, ...(get()[key] as unknown[])] } as Partial<DataState>);
    await repo(key).create(item as { id: string });
  },

  async patch(key, id, patch) {
    const stamp = { ...patch, updatedAt: new Date().toISOString() };
    set({
      [key]: (get()[key] as { id: string }[]).map((x) => (x.id === id ? { ...x, ...stamp } : x)),
    } as Partial<DataState>);
    await repo(key).update(id, stamp);
  },

  async remove(key, id) {
    set({ [key]: (get()[key] as { id: string }[]).filter((x) => x.id !== id) } as Partial<DataState>);
    await repo(key).remove(id);
  },

  async reset() {
    resetDemoData();
    const fresh = buildSeed();
    set({ ...(Object.fromEntries(COLLECTION_KEYS.map((k) => [k, fresh[k]])) as unknown as Collections) });
    await Promise.all(COLLECTION_KEYS.map((k) => (repositories[k] as unknown as { replaceAll(i: unknown[]): Promise<void> }).replaceAll(fresh[k])));
  },
}));

export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
