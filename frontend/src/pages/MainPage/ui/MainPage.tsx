import { Link } from 'react-router-dom';
import { memo } from 'react';
import MainMenu from '@/widgets/MainMenu/ui/MainMenu';
import cls from './MainPage.module.scss'

export const MainPage = memo(() => {
  return (
    <>
      <div className={cls.menu}>
        <h1 className={cls.title}>САБАКК</h1>
        <MainMenu />
        {/* Ссылка на страницу с комнатами */}
        <Link to="/rooms" className={cls.link}>
          Комнаты
        </Link>
      </div>
    </>
  );
});

export default MainPage;