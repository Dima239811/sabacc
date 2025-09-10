export enum GameStatus {
  STARTED = 'STARTED',
  PLAYER_RECONNECTED = 'PLAYER_RECONNECTED',
  ALL_USERS_JOINED = 'ALL_USERS_JOINED',
  ALL_USERS_CONNECTED = 'ALL_USERS_CONNECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_SECOND_USER = 'WAITING_SECOND_USER',
  PLAYER_DISCONNECTED = 'PLAYER_DISCONNECTED',
  FINISHED = 'FINISHED',
}
export enum TokensTypes {
  NO_TAX = "NO_TAX",
  TAKE_TWO_CHIPS = "TAKE_TWO_CHIPS",
  OTHER_PLAYERS_PAY_ONE = "OTHER_PLAYERS_PAY_ONE"
}
export interface GameState {
  currentPlayerId: number;
  round: number;
  bloodDiscard: Card | null;
  sandDiscard: Card | null;
  players: Player[];
}

export interface Player {
  playerId: number;
  tokens: TokensTypes[];
  remainChips: number;
  spentChips: number;
  bloodCards: Card[];
  sandCards: Card[];
  handRating: HandRating;
}

export interface Card {
  cardValueType: "VALUE_CARD" | "SYLOP" | "IMPOSTER";
  value?: number;
}

export interface HandRating {
  first: number;
  second: number;
}

export enum TurnType {
  DISCARD_SAND = "DISCARD_SAND",
  DISCARD_BLOOD = "DISCARD_BLOOD",
  GET_SAND = "GET_SAND",
  GET_BLOOD = "GET_BLOOD",
  GET_SAND_DISCARD = "GET_SAND_DISCARD",
  GET_BLOOD_DISCARD = "GET_BLOOD_DISCARD",
  SELECT_DICE = "SELECT_DICE",
}

