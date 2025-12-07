import { MainPage } from '@/pages/MainPage';
import { RoolsPage } from '@/pages/RoolsPage';
import { GamePage } from '@/pages/GamePage';
import AvailableRoomsPage from "@/pages/AvailableRoomsPage/AvailableRoomsPage";

import {
  AppRoutes, getRouteGame, getRouteMain, getRouteRools, getRouteRooms
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

    [AppRoutes.ROOMS]: {
      path: getRouteRooms(),
      element: <AvailableRoomsPage />,
      authOnly: false,
    },
};
