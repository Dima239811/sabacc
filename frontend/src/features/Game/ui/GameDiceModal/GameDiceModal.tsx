import { memo, useEffect, useState } from 'react';
import Dice1 from '@/shared/assets/images/cube1.png';
import Dice2 from '@/shared/assets/images/cube2.png';
import Dice3 from '@/shared/assets/images/cube3.png';
import Dice4 from '@/shared/assets/images/cube4.png';
import Dice5 from '@/shared/assets/images/cube5.png';
import Dice6 from '@/shared/assets/images/cube6.png';
import BackgroundTable from '@/shared/assets/images/table_cubes.png'
import cls from './GameDiceModal.module.scss';
import { classNames } from '@/shared/lib/classNames/classNames';

interface GameDiceModalProps {
  className?: string;
  onSelect: (index: number) => void;
  first: number;
  second: number;
}

const diceMap = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export const GameDiceModal = memo((props: GameDiceModalProps) => {
  const [diceImages, setDiceImages] = useState<string[]>([Dice1, Dice1]);
  const [countdown, setCountdown] = useState(5); // Обратный отсчёт (в секундах)
  const [isRolling, setIsRolling] = useState(true); // Флаг, крутятся ли кубики

  const { onSelect, first, second } = props;

  if (!first || !second) return null;

  useEffect(() => {
    setIsRolling(true);
    setCountdown(5); // Сбрасываем обратный отсчёт

    // Анимация смены картинок кубиков
    const interval = setInterval(() => {
      const randomDice1 = diceMap[Math.floor(Math.random() * 6)];
      const randomDice2 = diceMap[Math.floor(Math.random() * 6)];
      setDiceImages([randomDice1, randomDice2]);
    }, 200);

    // Таймер обратного отсчёта
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Останавливаем всё через 5 секунд
    setTimeout(() => {
      clearInterval(interval); // Остановка смены картинок
      clearInterval(countdownInterval); // Остановка таймера
      setDiceImages([diceMap[first - 1], diceMap[second - 1]]); // Устанавливаем финальные кубики
      setIsRolling(false); // Разрешаем выбор
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, [first, second]);

  return (
    <div className={cls.GameDiceModal}>
      <div className={cls.modalСontent}>
        <img src={BackgroundTable} className={cls.background} />
        <h2>Выберите кубик</h2>

        {/* Обратный отсчёт */}
        {isRolling && (
          <div className={cls.countdown}>
            Подождите {countdown} секунд...
          </div>
        )}

        <div className={cls.cubes}>
          {/* Кнопки с кубиками */}
          <button onClick={() => onSelect(0)} disabled={isRolling}>
            <img
              className={classNames(cls.dice, { [cls.spinning]: isRolling }, [])}
              src={diceImages[0]}
              alt="First dice"
            />
          </button>
          <button onClick={() => onSelect(1)} disabled={isRolling}>
            <img
              className={classNames(cls.dice, { [cls.spinning]: isRolling }, [])}
              src={diceImages[1]}
              alt="Second dice"
            />
          </button>
        </div>
      </div>
    </div>
  );
});
