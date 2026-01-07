import { loadState, saveState, STORAGE_KEY } from "@/lib/storage";

const CHANNEL_NAME = "scrapyard-demo-sync";

export function setupStateSync<T>(apply: (next: T) => void) {
  if (typeof window === "undefined") return () => undefined;

  const broadcast = createBroadcastChannel();
  const onExternalUpdate = () => {
    const next = loadState<T>();
    if (next) apply(next);
  };

  if (broadcast) {
    broadcast.addEventListener("message", onExternalUpdate);
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    onExternalUpdate();
  };

  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener("storage", onStorage);
    if (broadcast) {
      broadcast.removeEventListener("message", onExternalUpdate);
      broadcast.close();
    }
  };
}

export function notifyStateChange<T>(state: T) {
  saveState(state);
  if (typeof window === "undefined") return;

  const broadcast = createBroadcastChannel();
  if (broadcast) {
    broadcast.postMessage({ type: "STATE_UPDATED" });
    broadcast.close();
  }
}

function createBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (!("BroadcastChannel" in window)) return null;
  return new BroadcastChannel(CHANNEL_NAME);
}
