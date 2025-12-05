import { memo } from 'react';
import { classNames } from '@/shared/lib/classNames/classNames';

// изображения
import noTax from '@/shared/assets/images/Бесплатный розыгрыш.png';
import generalTariff from '@/shared/assets/images/Общий тариф.png';
import takeTwoChips from '@/shared/assets/images/Возврат.png';
import extraRefund from '@/shared/assets/images/Доп возврат.png';
import eblazement from '@/shared/assets/images/Хищение.png';
import generalAudit from '@/shared/assets/images/Общий аудит.png';
import immunity from '@/shared/assets/images/Иммунитет.png';
import exinasion from '@/shared/assets/images/Истощение.png';
import directTransaction from '@/shared/assets/images/Прямая транзакция.png';
import imposter from '@/shared/assets/images/Крупное мошенничество.png';
import ucenka from '@/shared/assets/images/Уценка.png';
import books from '@/shared/assets/images/Готовьте книги.png';
import embargo from '@/shared/assets/images/Эмбарго.png';

import cls from './GameTokens.module.scss';
import { TokensTypes } from '../../model/types/game';

interface GameTokensProps {
  userId: number | undefined;
  selectedTokens: TokensTypes[];
  isClickable?: boolean;
  sendTurn?: (action: string, payload: { token: TokensTypes }) => void;
}

const tokenData = [
  { type: "Бесплатный розыгрыш", image: noTax },
  { type: "Возврат", image: takeTwoChips },
  { type: "Общий тариф", image: generalTariff },
  { type: "Доп возврат", image: extraRefund },
  { type: "Хищение", image: eblazement },
  { type: "Общий аудит", image: generalAudit },
  { type: "Иммунитет", image: immunity },
  { type: "Истощение", image: exinasion },
  { type: "Прямая транзакция", image: directTransaction },
  { type: "Крупное мошенничество", image: imposter },
  { type: "Уценка", image: ucenka },
  { type: "Готовьте книги", image: books },
  { type: "Эмбарго", image: embargo },
];

export const GameTokens = memo((props: GameTokensProps) => {
  const { userId, selectedTokens, sendTurn, isClickable = false } = props;

  if (!userId) return <div />;

  const tokensToRender: TokensTypes[] = Array.isArray(selectedTokens) ? selectedTokens.slice(0, 3) : [];

  const handleTurnToken = (typeToken: TokensTypes) => {
    if (sendTurn) {
      sendTurn('PLAY_TOKEN', { token: typeToken });
    }
  };

  const getImageByType = (type: TokensTypes) => {
    const found = tokenData.find(t => t.type === type);
    console.log("type: " + type)
    return found?.image;
  };

  return (
    <div className={classNames(cls.controlsContainer, {}, [])}>
      {tokensToRender.map((type) => {
        const image = getImageByType(type);
        if (!image) {
            console.log("картинки нет для жетона "+ type.TokensTypes);
            return null; // не рендерим, если картинки нет
            }
        return (
          <button
            key={type}
            className={classNames(cls.cardButton, { [cls.clickable]: isClickable }, [])}
            onClick={() => handleTurnToken(type)}
            type="button"
          >
            <img src={image} alt={`Token`} />
          </button>
        );
      })}
    </div>
  );
});

export default GameTokens;