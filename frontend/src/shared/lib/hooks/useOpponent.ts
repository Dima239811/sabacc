import { RoomState } from "@/entities/Room/types/room";
import { User } from "@/features/Auth/model/types/auth";

export const useOpponent = (userId: number | undefined, roomState: RoomState): User | null => {
  if (!userId || !roomState) return null;
  return userId === roomState.playerFirst?.id ? roomState.playerSecond : roomState.playerFirst;
};