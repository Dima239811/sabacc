import { Suspense, memo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { routeConfig } from '../config/routeConfig';
import { AppRouteProps } from '../types/AppRouteProps';
import { OnlyAuth } from './OnlyAuth';

const AppRouter = () => {
  return <Routes>
    {Object.values(routeConfig).map((route: AppRouteProps) => {
      const element = <Suspense fallback='Loading...'>{route.element}</Suspense>

      return <Route
        key={route.path}
        path={route.path}
        element={
          route.authOnly ? (
            <OnlyAuth>{element}</OnlyAuth>
          ) : (
            element
          )
        }
      />
    })}
  </Routes>;
};

export default memo(AppRouter);
