import { memo, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Client } from '@stomp/stompjs';
import { classNames } from '@/shared/lib/classNames/classNames';
import { selectCurrentUser } from '@/features/Auth';
import { GameHeader } from '../GameHeader/GameHeader';
import { GameFooter } from '../GameFooter/GameFooter';
import { Card, GameState, TurnType } from '../../model/types/game';
import cls from './Game.module.scss';
import { useOpponent } from '@/shared/lib/hooks/useOpponent';
import { RoomState } from '@/entities/Room/types/room';
import { GameCardType } from '@/entities/GameCard';
import { GameCardModal } from '../GameCardModal/GameCardModal';
import { GameDiceModal } from '../GameDiceModal/GameDiceModal';
import { GameRoundResultModal } from '../GameRoundResultModal/GameRoundResultModal';
import { GameResultModal } from '../GameResultModal/GameResultModal';
import { useNavigate } from 'react-router-dom';
import { getRouteMain } from '@/shared/const/router';
import { GameTable } from '../GameTable/GameTable';
import { TokensTypes } from '../../model/types/game';

interface GameProps {
  client: Client;
  gameState: GameState;
  roomState: RoomState;
  diceDetails: { first: number; second: number } | null;
  handleDiceSelection: (index: number) => void;
  winnerId: number | null;
  roundResult: any | null;
  leaveCurrentRoom: any;
  fetchGameState: any;

  myTokens: TokensTypes[];
  userId?: number;
  onPlayToken?: (token: TokensTypes) => void;
}

export const Game = memo(({
  client,
  gameState,
  roomState,
  diceDetails,
  handleDiceSelection,
  winnerId,
  roundResult,
  leaveCurrentRoom,
  fetchGameState,
  myTokens,
  userId,
  onPlayToken
}: GameProps) => {
  const user = useSelector(selectCurrentUser);
  const opponent = useOpponent(user?.id, roomState);
  const navigate = useNavigate();

  const [modalCards, setModalCards] = useState<{ cards: Card[], type: GameCardType } | null>(null);
  const [currentModal, setCurrentModal] = useState<'ROUND' | 'GAME' | null>(null);

  const playerIndex = gameState.players[0].playerId === user?.id ? 0 : 1;

  const sendTurn = useCallback((turnType: string, details: object = {}) => {
    if (client && user) {
      client.publish({
        destination: `/app/input/session/${roomState.id}/turn`,
        body: JSON.stringify({
          sessionId: roomState.id,
          playerId: user.id,
          turnType,
          details
        }),
      });
    }
  }, [client, user, roomState]);

  // IMPORTANT: do not publish PLAY_TOKEN here to avoid duplicate publishes.
  // Publishing is done by the top-level (GamePage) via onPlayToken prop.
  const handlePlayToken = useCallback((token: TokensTypes) => {
    onPlayToken?.(token);
  }, [onPlayToken]);

  useEffect(() => {
    const playerIndex = gameState.players[0].playerId === user?.id ? 0 : 1;
    if (gameState.players[playerIndex].bloodCards.length > 1) {
      setModalCards({ cards: gameState.players[playerIndex].bloodCards, type: GameCardType.BLOOD });
    } else if (gameState.players[playerIndex].sandCards.length > 1) {
      setModalCards({ cards: gameState.players[playerIndex].sandCards, type: GameCardType.SAND });
    } else {
      setModalCards(null);
    }
  }, [gameState, user?.id]);

  useEffect(() => {
    if (roundResult) {
      setCurrentModal('ROUND');
    }
  }, [roundResult]);

  useEffect(() => {
    if (winnerId && !roundResult) {
      setCurrentModal('GAME');
    }
  }, [winnerId, roundResult]);

  useEffect(() => {
    if (gameState) {
      console.log('[DEBUG] Текущее состояние игры:', gameState);
    }
  }, [gameState]);

  const handleCloseRoundModal = () => {
    fetchGameState();
    if (winnerId) {
      setCurrentModal('GAME');
    } else {
      setCurrentModal(null);
    }
  };

  return (
    <>
      {currentModal === 'ROUND' && (
        <GameRoundResultModal
          roundResult={roundResult}
          roomState={roomState}
          onClose={handleCloseRoundModal}
        />
      )}

      {currentModal === 'GAME' && (
        <GameResultModal
          winnerId={winnerId!}
          onClose={() => navigate(getRouteMain())}
        />
      )}

      {modalCards && (
        <GameCardModal
          cards={modalCards.cards}
          sendTurn={sendTurn}
          type={modalCards.type}
        />
      )}

      {diceDetails && (
        <GameDiceModal
          first={diceDetails.first}
          second={diceDetails.second}
          onSelect={handleDiceSelection}
        />
      )}

      <div className={classNames(cls.container, {}, [])}>
        <GameHeader
          opponent={opponent}
          isCurentTurn={opponent?.id === gameState.currentPlayerId}
          gameState={gameState}
          selectedTokens={(opponent?.id === user?.id ? myTokens : (gameState.players[playerIndex] as any).selectedTokens) || []}
        />

        <GameTable
          gameState={gameState}
          sendTurn={sendTurn}
          userId={user?.id!}
        />

        <GameFooter
          user={user!}
          isCurentTurn={user?.id === gameState.currentPlayerId}
          gameState={gameState}
          sendTurn={sendTurn}
          leaveCurrentRoom={leaveCurrentRoom}
          selectedTokens={myTokens as any}
          onPlayToken={handlePlayToken}
        />
      </div>
    </>
  );
});

export default Game;