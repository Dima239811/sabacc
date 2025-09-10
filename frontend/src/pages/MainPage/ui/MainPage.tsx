
import { memo } from 'react';
import MainMenu from '@/widgets/MainMenu/ui/MainMenu';
import cls from './MainPage.module.scss'

export const MainPage = memo(() => {
  return (
    <>
      <div className={cls.menu}>
        <h1 className={cls.title}>SAB</h1>
        <MainMenu />
        <h1 className={cls.title}>ACC</h1>
      </div>
    </>
  );
});

export default MainPage;
