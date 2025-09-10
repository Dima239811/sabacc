import { memo, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Client, Message } from '@stomp/stompjs';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useWebSocketSubscription } from '@/shared/lib/hooks/useWebSocketSubscription';
import { selectCurrentUser } from '@/features/Auth';
import { GameHeader } from '../GameHeader/GameHeader';
import { GameFooter } from '../GameFooter/GameFooter';
import { Card, GameState, TurnType } from '../../model/types/game';
import cls from './Game.module.scss';
import { useOpponent } from '@/shared/lib/hooks/useOpponent';
import { RoomState } from '@/entities/Room/types/room';
import { GameCard, GameCardType } from '@/entities/GameCard';
import { i } from 'node_modules/vite/dist/node/types.d-aGj9QkWt';
import { GameCardModal } from '../GameCardModal/GameCardModal';
import { GameBank } from '../GameBank/GameBank';
import { GameDiceModal } from '../GameDiceModal/GameDiceModal';
import { Modal } from '@/shared/ui';
import { GameRoundResultModal } from '../GameRoundResultModal/GameRoundResultModal';
import { GameResultModal } from '../GameResultModal/GameResultModal';
import { useNavigate } from 'react-router-dom';
import { getRouteMain } from '@/shared/const/router';
import { GameTable } from '../GameTable/GameTable';

interface GameProps {
  client: Client;
  gameState: GameState;
  roomState: RoomState;
  diceDetails: { first: number; second: number } | null;
  handleDiceSelection: (index: number) => void;
  winnerId: number | null; // Новое свойство
  roundResult: any | null; // Новое свойство
  leaveCurrentRoom: any;
  fetchGameState: any;
}

export const Game = memo(({ client, gameState, roomState, diceDetails, handleDiceSelection, winnerId, roundResult, leaveCurrentRoom, fetchGameState }: GameProps) => {
  const user = useSelector(selectCurrentUser);
  const opponent = useOpponent(user?.id, roomState);
  const [modalCards, setModalCads] = useState<{ cards: Card[], type: GameCardType } | null>(null)
  const [showRoundModal, setShowRoundModal] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const navigate = useNavigate()

  const sendTurn = useCallback((turnType: string, details: object = {}) => {
    if (client && user) {
      client.publish({
        destination: `/app/input/session/${roomState.id}/turn`,
        body: JSON.stringify({
          sessionId: roomState.id,
          playerId: user.id,
          turnType,
          details: {
            ...details
          }
        }),
      })
    }
  },
    [client, user, roomState]
  );

  useEffect(() => {
    const playerIndex = gameState.players[0].playerId == user?.id ? 0 : 1;
    if (gameState.players[playerIndex].bloodCards.length > 1) {
      setModalCads({ cards: gameState.players[playerIndex].bloodCards, type: GameCardType.BLOOD })
    } else if (gameState.players[playerIndex].sandCards.length > 1) {
      setModalCads({ cards: gameState.players[playerIndex].sandCards, type: GameCardType.SAND })
    } else {
      setModalCads(null)
    }
  }, [gameState])


  useEffect(() => {
    if (roundResult) {
      setShowRoundModal(true); // Показ модального окна для результатов раунда
    }
  }, [roundResult]);

  useEffect(() => {
    if (winnerId) {
      setShowGameModal(true); // Показ модального окна для результатов игры
    }
  }, [winnerId]);

  const handleCloseRoundModal = () => {
    setShowRoundModal(false);
    fetchGameState();
  }


  return (
    <>
      {(showRoundModal && !showGameModal) && (<GameRoundResultModal roundResult={roundResult} roomState={roomState} onClose={handleCloseRoundModal} />)}
      {showGameModal && (<GameResultModal winnerId={winnerId!} onClose={() => navigate(getRouteMain())} />)}
      {modalCards && <GameCardModal cards={modalCards.cards} sendTurn={sendTurn} type={modalCards.type} />}
      {diceDetails && (<GameDiceModal first={diceDetails.first} second={diceDetails.second} onSelect={handleDiceSelection} />)}

      <div className={classNames(cls.container, {}, [])}>
        <GameHeader opponent={opponent} isCurentTurn={opponent?.id === gameState.currentPlayerId} gameState={gameState} />

        <GameTable gameState={gameState} sendTurn={sendTurn} userId={user?.id!} />

        <GameFooter user={user!} isCurentTurn={user?.id === gameState.currentPlayerId} gameState={gameState} sendTurn={sendTurn} leaveCurrentRoom={leaveCurrentRoom} />
      </div>
    </>
  );
});

export default Game;
