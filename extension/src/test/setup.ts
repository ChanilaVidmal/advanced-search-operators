import '@testing-library/jest-dom';
import { vi } from 'vitest';

Object.defineProperty(global, 'chrome', {
  value: {
    storage: {
      sync: {
        get: vi.fn((_keys: unknown, callback: (items: Record<string, unknown>) => void) => callback({})),
        set: vi.fn((_items: unknown, callback?: () => void) => callback?.()),
      },
      local: {
        get: vi.fn((_keys: unknown, callback: (items: Record<string, unknown>) => void) => callback({})),
        set: vi.fn((_items: unknown, callback?: () => void) => callback?.()),
      },
    },
    runtime: {
      getURL: vi.fn((path: string) => path),
      sendMessage: vi.fn(),
      onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
    },
    tabs: {
      create: vi.fn(),
      query: vi.fn(),
    },
    sidePanel: {
      open: vi.fn(),
      setOptions: vi.fn(),
    },
  },
  writable: true,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));