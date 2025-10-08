import { memo } from 'react';
import { classNames } from '@/shared/lib/classNames/classNames';
import token0 from '@/shared/assets/images/token_0.png';
import token1 from '@/shared/assets/images/token_-1.png';
import token2 from '@/shared/assets/images/token_+2.png';
import cls from './GameTokens.module.scss';
import { TokensTypes } from '../../model/types/game';

interface GameTokensProps {
  userId: number | undefined;
  tokens: TokensTypes[];
  isClickable?: boolean;
  sendTurn?: (action: string, payload: { token: TokensTypes }) => void;
}

const tokenData = [
  {
    type: TokensTypes.NO_TAX,
    image: token0,
  },
  {
    type: TokensTypes.TAKE_TWO_CHIPS,
    image: token2,
  },
  {
    type: TokensTypes.OTHER_PLAYERS_PAY_ONE,
    image: token1,
  },
];

export const GameTokens = memo((props: GameTokensProps) => {
  const { userId, tokens, sendTurn, isClickable = false } = props;

  if (!userId || !tokens) return <div></div>;

  const handleTurnToken = (typeToken: TokensTypes) => {
    if (sendTurn) {
      sendTurn('PLAY_TOKEN', { token: typeToken });
    }
  };

  return (
    <div className={classNames(cls.controlsContainer, {}, [])}>
      {tokenData.map(({ type, image }) => (
        tokens.includes(type) && (
          <button
            key={type}
            className={classNames(cls.cardButton, { [cls.clickable]: isClickable }, [])}
            onClick={() => handleTurnToken(type)}
          >
            <img src={image} alt={`Token ${type}`} />
          </button>
        )
      ))}
    </div>
  );
});

export default GameTokens;
