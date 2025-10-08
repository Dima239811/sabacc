import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, Auth } from '@/features/Auth';
import { getRouteGame, getRouteRools } from '@/shared/const/router';
import { classNames } from '@/shared/lib/classNames/classNames';
import { Button, Modal, AppLink } from '@/shared/ui';
import cls from './MainMenu.module.scss';

interface MainMenuProps {
  className?: string;
}

export const MainMenu = memo((props: MainMenuProps) => {
  const { className } = props;
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser)

  const handleOpen = () => {
    if (user) {
      navigate(getRouteGame());
    } else {
      setIsOpen(true);
    }
  };

  const handleClose = () => setIsOpen(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = ""
  }

  return (
    <div className={classNames(cls.Menu, {}, [className])}>
      <Button variant="btn" className={cls.mainLink} onClick={handleOpen}>
        Играть {user && 'как ' + user.username}
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <Auth />
      </Modal>

      <div className={cls.btns}>
        <AppLink variant="btn" to={getRouteRools()}>
          Правила
        </AppLink>

        {user &&
          <Button variant="btn" onClick={handleLogout}>
            Выйти
          </Button>
        }
      </div>
    </div>
  );
});

export default MainMenu;
