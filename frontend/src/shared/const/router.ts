export enum AppRoutes {
  MAIN = '',
  ROOLS = 'rools',
  GAME = 'in-game',
  ROOMS = 'rooms',
}

export const getRouteMain = () => `/`;
export const getRouteRools = () => `/rools`;
export const getRouteGame = () => `/in-game`;
export const getRouteRooms = () => `/rooms`;

export const AppRouteByPathPattern: Record<string, AppRoutes> = {
  [getRouteMain()]: AppRoutes.MAIN,
  [getRouteRools()]: AppRoutes.ROOLS,
  [getRouteGame()]: AppRoutes.GAME,
  [getRouteRooms()]: AppRoutes.ROOMS,
};