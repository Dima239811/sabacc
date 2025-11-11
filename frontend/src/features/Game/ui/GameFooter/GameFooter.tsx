import { classNames, Mods } from '@/shared/lib/classNames/classNames';
import { memo, useCallback, useEffect } from 'react';
import cls from './GameFooter.module.scss';
import RoolsImg from '@/shared/assets/images/rules.png'
import PassImg from '@/shared/assets/images/pass.png'
import GiveUpmg from '@/shared/assets/images/give_up.png'
import { User } from '@/features/Auth/model/types/auth';
import { GameTokens } from '../GameTokens/GameTokens';
import { AppLink } from '@/shared/ui';
import { getRouteMain, getRouteRools } from '@/shared/const/router';
import { GameState } from '../../model/types/game';
import { GameCard, GameCardType } from '@/entities/GameCard';
import CreditImg from '@/shared/assets/images/credit.png'
import { useNavigate } from 'react-router-dom';

interface GameFooterProps {
  user: User;
  isCurentTurn: boolean;
  gameState: GameState;
  sendTurn: any;
  leaveCurrentRoom: any;
}

export const GameFooter = memo((props: GameFooterProps) => {
  const { user, isCurentTurn, gameState, sendTurn, leaveCurrentRoom, ...otherProps } = props;
  const i = gameState?.players[0].playerId == user?.id ? 0 : 1;
  const navigate = useNavigate()

  const mods: Mods = {
    [cls.currentUserTurn]: isCurentTurn
  }
  const handlePass = () => {
    if (sendTurn) {
      sendTurn('PASS');
    }
  };
  const handleLeaveGame = () => {
    if (leaveCurrentRoom) {
      leaveCurrentRoom();
      setTimeout(() => { navigate(getRouteMain())}, 500)
    };
  };

  return (
    <div className={classNames(cls.footer, {}, [])}>
      <div className={classNames(cls.myCards)}>
        <GameCard card={gameState.players[i].bloodCards[0]} type={GameCardType.BLOOD}></GameCard>
        <GameCard card={gameState.players[i].sandCards[0]} type={GameCardType.SAND}></GameCard>
      </div>


      <div className={cls.myBank}>
        <span>Остаток: {gameState.players[i].remainChips} </span>
        <img src={CreditImg} alt="Credit" />
      </div>

      <div className={cls.controls}>
        <GameTokens userId={user?.id} tokens={gameState.players[i].tokens} isClickable sendTurn={sendTurn} />
      </div>

      <button className={cls.button} onClick={handleLeaveGame}><img src={GiveUpmg} alt="" /></button>
      <AppLink className={cls.button} to={getRouteRools()}><img src={RoolsImg} alt="" /></AppLink>
      <button className={cls.button} onClick={handlePass}><img src={PassImg} alt="" /></button>

      <div className={classNames(cls.nickname, mods, [])}>
        <span>{user?.username || 'Opponent'}</span>
      </div>
    </div>
  );
});
