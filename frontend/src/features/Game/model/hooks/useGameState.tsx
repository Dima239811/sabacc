import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/features/Auth/model/selectors/authSelector';
import { useWebSocketGame } from '@/shared/lib/hooks/useWebSocketGame';
import { useSetupRoom } from '@/shared/lib/hooks/useSetupRoom';
import axios from 'axios';
import { GameState, GameStatus, TurnType } from '../types/game';

export const useGameState = () => {
  const playerId = useSelector(selectCurrentUser)?.id;
  const sessionId = playerId && useSetupRoom(playerId);
  const client = useWebSocketGame(playerId, sessionId);

  const [roomState, setRoomState] = useState<any>();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [diceDetails, setDiceDetails] = useState(null);
  const [winnerId, setWinnerId] = useState()
  const [roundResult, setRoundResult] = useState()

  const fetchGameState = async () => {
    if (!sessionId) return;
    try {
      const data = (
        await axios.get(`${__API__}/api/v1/room/game/current-state?sessionId=${sessionId}`)
      ).data;
      setGameState(data);
    } catch (err) {
      console.log('data');
      setTimeout(() => fetchGameState(), 500);
    }
  };

  const leaveCurrentRoom = async () => {
    if (!sessionId) return;
    await axios.post(`${__API__}/api/v1/room/leave/${sessionId}?userId=${playerId}`);
    localStorage.removeItem('roomId');
    setGameState(null)
  };

  const fetchRoomState = async () => {
    if (!sessionId) return;
    const data = (await axios.get(`${__API__}/api/v1/room/${sessionId}`)).data;
    setRoomState(data);
  };

  // Отображение модалки кубика только если ход принадлежит текущему игроку
  const showDiceModal = (details: any) => {
    setDiceDetails(details);
  };

  // Обработка выбора кубика
  const handleDiceSelection = (index: number) => {
    if (client && playerId) {
      client.publish({
        destination: `/app/input/session/${roomState.id}/turn`,
        body: JSON.stringify({
          sessionId: roomState.id,
          playerId: playerId,
          turnType: TurnType.SELECT_DICE,
          details: {
            index
          },
        }),
      });
    }
  };

  useEffect(() => {
    if (client && sessionId) {
      const handleConnect = () => {
        fetchRoomState();
        fetchGameState();

        // Подписка на обновление прогресса игры
        client.subscribe(`/queue/session/${sessionId}/game-progress`, (message) => {
          fetchGameState();
          fetchRoomState();
        });

        // Подписка на подтвержденные ходы
        client.subscribe(`/queue/session/${sessionId}/accepted-turns`, (message) => {
          const data = JSON.parse(message.body);

          // Проверяем, если ход ожидает кубиков и принадлежит текущему игроку
          if (data.turnType === "AWAITING_DICE" && data.playerId === playerId) {
            showDiceModal(data.details); // Показ модалки кубиков
          } else {
            showDiceModal(null)
          }

          fetchGameState();
          fetchRoomState();
        });

        client.subscribe(`/queue/session/${sessionId}/errors`, (message) => {
          console.error(JSON.stringify(message.body));
        });

        client.subscribe(`/queue/session/${sessionId}/game-results`, (message) => {
          const data = JSON.parse(message.body);
          console.log(data)
          setWinnerId(data.winnerId); // Сохраняем ID победителя
        });

        client.subscribe(`/queue/session/${sessionId}/round-results`, (message) => {
          const data = JSON.parse(message.body);
          console.log(data)
          setRoundResult(data); // Сохраняем результаты раунда
          fetchGameState();
          fetchRoomState();
        });
      };

      client.onConnect = handleConnect;
      setIsLoading(false);
    }
  }, [client, sessionId]);

  // Проверка, идет ли игра
  const isGameInProgress = () => {
    const status = roomState?.status;
    return (
      status !== GameStatus.WAITING_SECOND_USER &&
      status !== GameStatus.PLAYER_DISCONNECTED &&
      status !== GameStatus.FINISHED
    );
  };

  return {
    client,
    gameState,
    roomState,
    isLoading,
    isGameInProgress: isGameInProgress(),
    fetchGameState,
    diceDetails,
    handleDiceSelection,
    winnerId,
    roundResult,
    leaveCurrentRoom
  };
};
