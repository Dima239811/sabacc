import { useState, useEffect } from 'react';
import axios from 'axios';

// было const API_BASE = 'http://localhost:8080/api/v1/room';
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
      // НЕ вызываем leaveAllRooms автоматически сразу — сначала проверим localStorage
      await pause(300); // небольшая пауза чтобы все инициализации успели завершиться

      let roomId: string | undefined = localStorage.getItem('roomId') ?? undefined;

      if (roomId) {
        // Если есть сохранённый roomId — попробуем проверить его валидность
        try {
          const data = (await axios.get(`${API_BASE}/${roomId}`)).data;
          const amIPlayer = data.playerFirst?.id === playerId || data.playerSecond?.id === playerId;
          const isFinished = data.status === 'FINISHED';

          if (!amIPlayer || isFinished) {
            // если мы не участник или комната завершена — удаляем локальный roomId и сообщаем серверу
            console.log('[useSetupRoom] saved roomId не валиден. Очищаем и выходим из всех комнат.', { roomId, amIPlayer, isFinished });
            localStorage.removeItem('roomId');
            await leaveAllRooms();
            roomId = undefined;
          } else {
            // валидная комната — используем её, не вызываем leaveAllRooms и не трогаем сервер
            console.log('[useSetupRoom] найден валидный saved roomId, используем его без leaveAllRooms:', roomId);
            setSessionId(+roomId);
            return; // мы восстановили сессию — заканчиваем setup
          }
        } catch (error) {
          console.warn('[useSetupRoom] ошибка при проверке saved roomId — очищаем и вызываем leaveAllRooms', error);
          localStorage.removeItem('roomId');
          await leaveAllRooms();
          roomId = undefined;
        }
      }

      // Если здесь roomId нет — продолжаем поиск доступных комнат / создание новой
      try {
        await pause(1000);

        let availableRoomsResponse = await axios.get(`${API_BASE}/available-for-join?userId=${playerId}`);
        let availableRooms = availableRoomsResponse.data;

        console.log('[useSetupRoom] доступные комнаты:', availableRooms.map((r: any) => ({ id: r.id, status: r.status })));

        roomId = availableRooms.length ? availableRooms[0].id : undefined;

        if (roomId) {
          const roomToJoin = availableRooms.find((r: any) => r.id === roomId);
          console.log('[useSetupRoom] Присоединяемся к комнате:', roomToJoin);
          try {
            await axios.post(`${API_BASE}/${roomId}/join?userId=${playerId}`);
            console.log('[useSetupRoom] Успешно присоединились к комнате', roomId);
          } catch (error: any) {
            console.error('[useSetupRoom] Ошибка при join:', error);
            roomId = undefined;
          }
        }

        if (!roomId) {
          const roomResponse = await axios.post(`${API_BASE}/create?userId=${playerId}`);
          roomId = roomResponse.data.id;
          console.log('[useSetupRoom] Создана новая комната:', roomId, 'статус:', roomResponse.data.status);
        }

        if (roomId) {
          localStorage.setItem('roomId', roomId);
          setSessionId(+roomId);
        }
      } catch (error) {
        console.error('[useSetupRoom] Ошибка при получении доступных комнат или создании:', error);
        // безопасно очищаем и пробуем убрать старые соединения
        await leaveAllRooms();
      }
    };

    setupRoomAndWebSocket();
  }, [playerId]);

  return sessionId;
};