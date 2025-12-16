import { useSyncExternalStore } from "react";
import { playerTokensStore } from "./hooks/playerTokensStore";

export function usePlayerTokens() {
  return useSyncExternalStore(
    playerTokensStore.subscribe.bind(playerTokensStore),
    () => playerTokensStore.getState()
  );
}
