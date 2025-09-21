import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/features/Auth/model/selectors/authSelector';
import { useWebSocketGame } from '@/shared/lib/hooks/useWebSocketGame';
import { useSetupRoom } from '@/shared/lib/hooks/useSetupRoom';
import axios from 'axios';
import { GameState, GameStatus, TurnType } from '../types/game';

export const useGameState = () => {
  const playerId = useSelector(selectCurrentUser)?.id;
  const sessionId = useSetupRoom(playerId);
  const client = useWebSocketGame(playerId, sessionId || undefined);

  const [roomState, setRoomState] = useState<any>();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [diceDetails, setDiceDetails] = useState(null);
  const [winnerId, setWinnerId] = useState()
  const [roundResult, setRoundResult] = useState()

  const fetchGameState = async (id: string) => {
    if (!id) return;
    try {
      const data = (await axios.get(`${__API__}/v1/room/game/current-state?sessionId=${id}`)).data;
      setGameState(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.warn("Сессия не найдена, нужно создать новую или подождать");
        return;
      }
      console.error(err);
    }
  };


  const leaveCurrentRoom = async () => {
    if (!sessionId) return;
    await axios.post(`${__API__}/v1/room/leave/${sessionId}?userId=${playerId}`);
    localStorage.removeItem('roomId');
    setGameState(null)
  };

  const fetchRoomState = async () => {
    if (!sessionId) return;
    const data = (await axios.get(`${__API__}/v1/room/${sessionId}`)).data;
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
        fetchRoomState(sessionId);
        fetchGameState(sessionId);

        // Подписка на обновление прогресса игры
        client.subscribe(`/queue/session/${sessionId}/game-progress`, (message) => {
          if (data.status === 'STARTED') {
              setRoomState(prev => ({ ...prev, status: 'IN_PROGRESS' }));
            } else if (data.status === 'PLAYER_DISCONNECTED') {
              setRoomState(prev => ({ ...prev, status: 'PLAYER_DISCONNECTED' }));
            } else if (data.status === 'PLAYER_RECONNECTED') {
              setRoomState(prev => ({ ...prev, status: 'IN_PROGRESS' }));
            }

            fetchGameState(sessionId);
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

          fetchGameState(sessionId);
          fetchRoomState(sessionId);
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
          fetchGameState(sessionId);
          fetchRoomState(sessionId);
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
