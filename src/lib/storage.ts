export const STORAGE_KEY = "scrapyard-demo-state";
export const SCHEMA_VERSION = 1;

export interface StorageDriver {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem?: (key: string) => void;
}

export interface PersistedState<T> {
  version: number;
  savedAt: string;
  data: T;
}

export function migrateState<T>(vFrom: number, vTo: number, data: unknown): T {
  if (vFrom === vTo) {
    return data as T;
  }
  // Placeholder for future migrations.
  return data as T;
}

export function createStorageDriver(): StorageDriver | null {
  if (typeof window === "undefined") return null;
  if (!window.localStorage) return null;
  return window.localStorage;
}

export function loadState<T>(key: string = STORAGE_KEY, driver: StorageDriver | null = createStorageDriver()): T | null {
  if (!driver) return null;
  const raw = driver.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PersistedState<T>;
    const version = typeof parsed.version === "number" ? parsed.version : 0;
    const data = migrateState<T>(version, SCHEMA_VERSION, parsed.data);
    return data;
  } catch {
    return null;
  }
}

export function saveState<T>(
  data: T,
  key: string = STORAGE_KEY,
  driver: StorageDriver | null = createStorageDriver()
): void {
  if (!driver) return;
  const payload: PersistedState<T> = {
    version: SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    data,
  };
  driver.setItem(key, JSON.stringify(payload));
}
