// Safe localStorage wrapper that gracefully handles restricted iframe environments,
// third-party cookie blocking, private browsing, and Safari/iOS SecurityError exceptions.

class MemoryStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

const memoryFallback = new MemoryStorage();

function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const hasLocalStorage = isLocalStorageAvailable();

export const safeStorage = {
  getItem(key: string): string | null {
    if (hasLocalStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return memoryFallback.getItem(key);
      }
    }
    return memoryFallback.getItem(key);
  },

  setItem(key: string, value: string): void {
    if (hasLocalStorage) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        memoryFallback.setItem(key, value);
        return;
      }
    }
    memoryFallback.setItem(key, value);
  },

  removeItem(key: string): void {
    if (hasLocalStorage) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch {
        memoryFallback.removeItem(key);
        return;
      }
    }
    memoryFallback.removeItem(key);
  },

  clear(): void {
    if (hasLocalStorage) {
      try {
        window.localStorage.clear();
      } catch {
        memoryFallback.clear();
      }
    } else {
      memoryFallback.clear();
    }
  }
};
