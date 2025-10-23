import { ChangeEvent, memo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRouteGame } from '@/shared/const/router';
import { AppLink, Button, HStack } from '@/shared/ui';
import { useCreateAnonymousUserMutation } from '../model/services/authService';
import cls from './Auth.module.scss';
import { UserExistsModal } from '@/shared/ui/UsernameModalForm/UserExistsModal';

export const Auth = memo(() => {
  const [isValidName, setIsValidName] = useState<boolean>(false);
  const [isStartingType, setIsStartingType] = useState<boolean>(false);
  const [createAnonymousUser] = useCreateAnonymousUserMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInputOpen, setIsInputOpen] = useState(true); // добавляем состояние для видимости формы

  const navigate = useNavigate();
  const inputNameRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsStartingType(true);
    if (e.target.value.length >= 4) {
      setIsValidName(true);
    } else {
      setIsValidName(false);
    }
  };

  const handleToGame = async () => {
    if (!inputNameRef.current?.value) return;

    try {
      await createAnonymousUser({ username: inputNameRef.current.value }).unwrap();
      setIsInputOpen(false); // скрываем форму
      navigate(getRouteGame());
    } catch (error: any) {
      if (error?.status === 400 && error?.data?.errorCode === "already_exists") {
        console.log("такой пользователь уже существует");
        setIsModalOpen(true);
        if (inputNameRef.current) inputNameRef.current.value = "";
        setIsValidName(false);
        setIsStartingType(false);
      } else {
        console.error('Ошибка создания временного пользователя:', error);
      }
    }
  };


  // Если форма скрыта и модалка ошибки неактивна — ничего не рендерим
  if (!isInputOpen && !isModalOpen) return null;

  return (
    <div className={cls.modal}>
      {/* Добавляем заголовок */}
      <h3 className={cls.title}>Введите имя</h3>
      {/* Форма ввода только если isInputOpen */}
      {isInputOpen && (
        <HStack className={cls.inputWrapper} max>
          <input
            className={cls.input}

            onChange={handleInputChange}
            ref={inputNameRef}
          />

          {isValidName && (
            <Button className={cls.goToGame} onClick={handleToGame}>ДАЛЕЕ</Button>
          )}

          {!isValidName && isStartingType && (
            <span className={cls.error}>Минимум 4 символа.</span>
          )}
        </HStack>
      )}

      <UserExistsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
});

export default Auth;