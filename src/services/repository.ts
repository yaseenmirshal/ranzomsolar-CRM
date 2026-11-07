import { storage } from "./storage";

export interface Entity { id: string }

/** Every data collection is accessed through this contract. Swap the implementation, not the UI. */
export interface Repository<T extends Entity> {
  list(): Promise<T[]>;
  create(item: T): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
  /** Replace the full collection (used for demo seeding / reset). */
  replaceAll(items: T[]): Promise<void>;
}

/** Demo implementation backed by localStorage. */
export class LocalRepository<T extends Entity> implements Repository<T> {
  constructor(private key: string, private seed: () => T[]) {}

  private read(): T[] {
    const existing = storage.read<T[]>(this.key);
    if (existing) return existing;
    const seeded = this.seed();
    storage.write(this.key, seeded);
    return seeded;
  }
  async list() { return this.read(); }
  async create(item: T) {
    storage.write(this.key, [item, ...this.read()]);
    return item;
  }
  async update(id: string, patch: Partial<T>) {
    let updated: T | undefined;
    const next = this.read().map((x) => (x.id === id ? (updated = { ...x, ...patch }) : x));
    storage.write(this.key, next);
    if (!updated) throw new Error(`Record ${id} not found`);
    return updated;
  }
  async remove(id: string) {
    storage.write(this.key, this.read().filter((x) => x.id !== id));
  }
  async replaceAll(items: T[]) { storage.write(this.key, items); }
}
