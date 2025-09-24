import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/v1/room'; // обновил путь под контроллер

export const useSetupRoom = (playerId: number) => {
  const [sessionId, setSessionId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!playerId) return;

    const leaveAllRooms = async () => {
      localStorage.removeItem('roomId');
      try {
        await axios.post(`${API_BASE}/leave/all?userId=${playerId}`);
      } catch (error) {
        console.warn('Ошибка при выходе из всех комнат', error);
      }
    };

    const setupRoomAndWebSocket = async () => {
      let roomId: string | undefined = localStorage.getItem('roomId') ?? undefined;

      // Проверка комнаты из localStorage
      if (roomId) {
        try {
          const data = (await axios.get(`${API_BASE}/${roomId}`)).data;
          if (
            data.status === 'FINISHED' ||
            (data.playerFirst?.id !== playerId && data.playerSecond?.id !== playerId)
          ) {
            roomId = undefined;
          }
        } catch (error) {
          console.error('Ошибка при получении информации о комнате:', error);
          roomId = undefined;
        }
      }

      // Если нет комнаты — ищем доступную
      if (!roomId) {
        try {
          const availableRoomsResponse = await axios.get(`${API_BASE}/available-for-join?userId=${playerId}`);
          const availableRooms = availableRoomsResponse.data;
          console.log('Доступные комнаты с сервера:', availableRooms);

          roomId = availableRooms.length ? availableRooms[0].id : undefined;

          if (roomId) {
            try {
              await axios.post(`${API_BASE}/${roomId}/join?userId=${playerId}`);
            } catch (error: any) {
              console.error('Ошибка при join:', error);
              roomId = undefined;
            }
          } else {
            const roomResponse = await axios.post(`${API_BASE}/create?userId=${playerId}`);
            roomId = roomResponse.data.id;
          }
        } catch (error) {
          console.error('Ошибка при получении доступных комнат или создании:', error);
          await leaveAllRooms();
        }
      }

      // Сохраняем roomId
      if (roomId) {
        localStorage.setItem('roomId', roomId);
        setSessionId(+roomId);
      }
    };

    setupRoomAndWebSocket();
  }, [playerId]);

  return sessionId;
};
