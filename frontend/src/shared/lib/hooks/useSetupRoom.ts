import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/v1/room';
const pause = (ms: number) => new Promise(res => setTimeout(res, ms));

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
      await leaveAllRooms();

      await pause(1000);

      let roomId: string | undefined = localStorage.getItem('roomId') ?? undefined;

      if (roomId) {
        try {
          const data = (await axios.get(`${API_BASE}/${roomId}`)).data;
          if (
            data.status === 'FINISHED' ||
            (data.playerFirst?.id !== playerId && data.playerSecond?.id !== playerId)
          ) {
            console.log('Комната завершена или игрок не является участником — удаляем roomId из localStorage');
            localStorage.removeItem('roomId');
            roomId = undefined;
          }
        } catch (error) {
          console.error('Ошибка при получении информации о комнате:', error);
          localStorage.removeItem('roomId');
          roomId = undefined;
        }
      }

      if (!roomId) {
        try {
          const availableRoomsResponse = await axios.get(`${API_BASE}/available-for-join?userId=${playerId}`);
          const availableRooms = availableRoomsResponse.data;

          // Логирование доступных комнат
          console.log('[DEBUG] Доступные комнаты:', availableRooms.map((r: any) => ({
            id: r.id,
            status: r.status,
            playerFirst: r.playerFirst?.id,
            playerSecond: r.playerSecond?.id,
          })));

          roomId = availableRooms.length ? availableRooms[0].id : undefined;

          if (roomId) {
            const roomToJoin = availableRooms.find((r: any) => r.id === roomId);
            console.log('[DEBUG] Присоединяемся к комнате:', roomToJoin);

            try {
              await axios.post(`${API_BASE}/${roomId}/join?userId=${playerId}`);
              console.log('[INFO] Успешно присоединились к комнате', roomId);
            } catch (error: any) {
              console.error('[ERROR] Ошибка при join:', error);
              roomId = undefined;
            }
          } else {
            const roomResponse = await axios.post(`${API_BASE}/create?userId=${playerId}`);
            roomId = roomResponse.data.id;
            console.log('[INFO] Создана новая комната:', roomId, 'статус:', roomResponse.data.status);
          }
        } catch (error) {
          console.error('[ERROR] Ошибка при получении доступных комнат или создании:', error);
          await leaveAllRooms();
        }
      }

      if (roomId) {
        localStorage.setItem('roomId', roomId);
        setSessionId(+roomId);
      }
    };

    setupRoomAndWebSocket();
  }, [playerId]);

  return sessionId;
};
