import { appConfig } from "@/lib/config";

const k = (key: string) => `${appConfig.storagePrefix}${key}`;

export const storage = {
  read<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(k(key));
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  write<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(k(key), JSON.stringify(value));
    } catch {
      /* storage full or unavailable — demo data simply won't persist */
    }
  },
  clearAll(): void {
    if (typeof window === "undefined") return;
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(appConfig.storagePrefix))
      .forEach((key) => window.localStorage.removeItem(key));
  },
};
