import { buildSeed, type SeedData } from "@/data/seed";
import { storage } from "./storage";
import { LocalRepository, type Entity, type Repository } from "./repository";

export type CollectionKey = Exclude<keyof SeedData, "team">;
export const COLLECTION_KEYS: CollectionKey[] = [
  "enquiries", "contacts", "followUps", "surveys", "quotations", "orders", "installations",
  "inventory", "stockMovements", "invoices", "payments", "services", "activity", "notifications",
];

let seedCache: SeedData | null = null;
const seed = () => (seedCache ??= buildSeed());

function make<K extends CollectionKey>(key: K): Repository<SeedData[K][number] & Entity> {
  type Item = SeedData[K][number] & Entity;
  return new LocalRepository<Item>(key, () => seed()[key] as unknown as Item[]);
}

export const repositories = Object.fromEntries(
  COLLECTION_KEYS.map((key) => [key, make(key)]),
) as { [K in CollectionKey]: Repository<SeedData[K][number] & Entity> };

/** Clears persisted demo data and re-seeds from scratch (Settings → Reset Demo Data). */
export function resetDemoData() {
  storage.clearAll();
  seedCache = null;
}
