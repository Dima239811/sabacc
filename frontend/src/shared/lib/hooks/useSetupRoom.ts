import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api'; // Базовый URL бэкенда

export const useSetupRoom = (playerId: number) => {
  const [sessionId, setSessionId] = useState<number | undefined>(undefined);

  useEffect(() => {
    const leaveAllRooms = async () => {
      localStorage.removeItem('roomId');
      try {
        await axios.post(`${API_BASE}/v1/room/leave/all?userId=${playerId}`);
      } catch (error) {
        console.warn('Ошибка при выходе из комнат, продолжаем работу', error);
      }
    };


const setupRoomAndWebSocket = async () => {
  let roomId: string | undefined = localStorage.getItem('roomId') ?? undefined;

  // Проверка последней комнаты
  if (roomId) {
    try {
      const data = (await axios.get(`${API_BASE}/v1/room/${roomId}`)).data;
      if (data.status === 'FINISHED' ||
          (data.playerFirst?.id !== playerId && data.playerSecond?.id !== playerId)) {
        roomId = undefined;
      }
    } catch (error) {
      console.error('Ошибка при получении информации о комнате:', error);
      roomId = undefined;
    }
  }

  // Если нет комнаты, ищем доступную
  if (!roomId) {
    let availableRooms: any[] = [];
    try {
      const availableRoomsResponse = await axios.get(`${API_BASE}/v1/room/available-for-join?userId=${playerId}`);
      availableRooms = availableRoomsResponse.data;

      // ⚡ вот здесь выводим все комнаты, которые пришли с сервера
      console.log('Доступные комнаты с сервера:', availableRooms);

    } catch (error) {
      console.error('Ошибка при получении доступных комнат:', error);
      await leaveAllRooms();
    }

    roomId = availableRooms.length ? availableRooms[0].id : undefined;

    try {
      if (roomId) {
        await axios.post(`${API_BASE}/v1/room/${roomId}/join?userId=${playerId}`);
      } else {
        const roomResponse = await axios.post(`${API_BASE}/v1/room/create?userId=${playerId}`);
        roomId = roomResponse.data.id;
      }
    } catch (error) {
      console.error('Ошибка при входе/создании комнаты:', error);
      roomId = undefined;
    }
  }

  if (roomId) {
    localStorage.setItem('roomId', roomId);
    setSessionId(+roomId);
  }
};



    if (playerId) {
      setupRoomAndWebSocket();
    }
  }, [playerId]);

  return sessionId;
};
