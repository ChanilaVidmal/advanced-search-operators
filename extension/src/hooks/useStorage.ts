import { useState, useEffect } from 'react';

const hasChromeStorage = typeof chrome !== 'undefined' && chrome.storage?.sync;

export function useStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (hasChromeStorage) {
      chrome.storage.sync.get([key], (result: Record<string, unknown>) => {
        if (result[key] !== undefined) {
          setValue(result[key] as T);
        }
        setLoaded(true);
      });
    } else {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        try {
          setValue(JSON.parse(stored));
        } catch {
          setValue(stored as unknown as T);
        }
      }
      setLoaded(true);
    }
  }, [key]);

  const updateValue = (newValue: T | ((prev: T) => T)) => {
    const resolvedValue = newValue instanceof Function ? newValue(value) : newValue;
    setValue(resolvedValue);
    if (hasChromeStorage) {
      chrome.storage.sync.set({ [key]: resolvedValue });
    } else {
      localStorage.setItem(key, JSON.stringify(resolvedValue));
    }
  };

  return [value, updateValue, loaded];
}