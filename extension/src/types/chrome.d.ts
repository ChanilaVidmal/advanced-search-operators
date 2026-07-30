declare namespace chrome {
  namespace storage {
    interface StorageArea {
      get(keys: string | string[] | Record<string, unknown> | null, callback: (items: Record<string, unknown>) => void): void;
      set(items: Record<string, unknown>, callback?: () => void): void;
      remove(keys: string | string[], callback?: () => void): void;
      clear(callback?: () => void): void;
      getBytesInUse(keys: string | string[] | null, callback: (bytesInUse: number) => void): void;
    }
    namespace sync {
      function get(keys: string | string[] | Record<string, unknown> | null, callback: (items: Record<string, unknown>) => void): void;
      function set(items: Record<string, unknown>, callback?: () => void): void;
      function remove(keys: string | string[], callback?: () => void): void;
      function clear(callback?: () => void): void;
    }
    namespace local {
      function get(keys: string | string[] | Record<string, unknown> | null, callback: (items: Record<string, unknown>) => void): void;
      function set(items: Record<string, unknown>, callback?: () => void): void;
      function remove(keys: string | string[], callback?: () => void): void;
      function clear(callback?: () => void): void;
    }
  }

  namespace runtime {
    function sendMessage(message: unknown, callback?: (response: unknown) => void): void;
    interface MessageSender {
      tab?: tabs.Tab;
      frameId?: number;
      id?: string;
      url?: string;
      origin?: string;
    }
    interface MessageEvent {
      (message: unknown, sender: MessageSender, sendResponse: (response?: unknown) => void): void;
    }
    const onMessage: {
      addListener(callback: MessageEvent): void;
      removeListener(callback: MessageEvent): void;
    };
    const onInstalled: {
      addListener(callback: (details: { reason: string; previousVersion?: string }) => void): void;
    };
    function getURL(path: string): string;
  }

  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
      title?: string;
      active: boolean;
      windowId: number;
    }
    interface CreateProperties {
      url?: string;
      active?: boolean;
      pinned?: boolean;
    }
    function create(properties: CreateProperties, callback?: (tab: Tab) => void): void;
    function query(queryInfo: { active?: boolean; currentWindow?: boolean }, callback: (tabs: Tab[]) => void): void;
  }

  namespace sidePanel {
    interface PanelBehavior {
      openPanelOnActionClick: boolean;
    }
    function setPanelBehavior(behavior: PanelBehavior): Promise<void>;
    function open(options?: { windowId?: number }): Promise<void>;
    function setOptions(options: { path?: string; enabled?: boolean }): Promise<void>;
  }

  namespace commands {
    interface Command {
      name: string;
      description?: string;
      shortcut?: string;
    }
    const onCommand: {
      addListener(callback: (command: string, tab?: tabs.Tab) => void): void;
    };
  }
}