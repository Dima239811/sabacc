import './styles/index.scss'
import { Suspense, useEffect, useState } from 'react';
import AppRouter from './providers/Router/ui/AppRouter';
import { setUser } from '@/features/Auth/model/slice/authSlice';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { User } from '@/features/Auth/model/types/auth';
import { USER_LOCALSTORAGE_KEY } from '@/shared/const/localstorage';
import MainImg from '@/shared/assets/images/main.jpg';

const App = () => {
  const dispatch = useAppDispatch();
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  
  useEffect(() => {
    const userData = localStorage.getItem(USER_LOCALSTORAGE_KEY);
    if (userData && userData !== 'undefined') {
      const user: User = JSON.parse(userData);
      dispatch(setUser(user))
    }
    setIsUserLoaded(true);
  }, [])

  if (!isUserLoaded) {
      return <div>Loading...</div>; // не рендерим маршруты пока user не восстановлен
  }

  return (
    <div id="app" className={'app'}>
      <img className='mainBackgroundImage' src={MainImg} />

      <Suspense fallback={'Loading ...'}>
        <AppRouter />
      </Suspense>
    </div>
  )
}

export default App
