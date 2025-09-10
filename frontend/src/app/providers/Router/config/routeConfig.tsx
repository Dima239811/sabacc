import { MainPage } from '@/pages/MainPage';
import { RoolsPage } from '@/pages/RoolsPage';
import { GamePage } from '@/pages/GamePage';
import {
  AppRoutes, getRouteGame, getRouteMain, getRouteRools
} from '@/shared/const/router';
import { AppRouteProps } from '../types/AppRouteProps';

export const routeConfig: Record<AppRoutes, AppRouteProps> = {
  [AppRoutes.MAIN]: {
    path: getRouteMain(),
    element: <MainPage />,
  },
  [AppRoutes.ROOLS]: {
    path: getRouteRools(),
    element: <RoolsPage />,
  },
  [AppRoutes.GAME]: {
    path: getRouteGame(),
    element: <GamePage />,
   authOnly: true,
  },
};
