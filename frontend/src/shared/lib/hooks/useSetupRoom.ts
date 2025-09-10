import { useState, useEffect } from 'react';
import axios from 'axios';

export const useSetupRoom = (playerId: number) => {
  const [sessionId, setSessionId] = useState<number | undefined>(undefined);

  useEffect(() => {
    const leaveAllRooms = async () => {
      localStorage.removeItem('roomId');
      try {
        await axios.post(`${__API__}/api/v1/room/leave/all?userId=${playerId}`);
      } catch (error) {
        console.error('Ошибка при выходе из комнат:', error);
      }
    };


    const setupRoomAndWebSocket = async () => {
      // достаю последнюю посещенную комнату
      let roomId: string | undefined = localStorage.getItem('roomId') ?? undefined;

      // если такая есть, то проверяю, не закончилась ли сессия и нахожусь ли я в ней
      if (roomId) {
        const data = (await axios.get(`${__API__}/api/v1/room/${roomId}`)).data;
        if (data.status === 'FINISHED' || (data.playerFirst.id !== playerId && data.playerSecond.id !== playerId)) {
          // если закончилась или меня там нет, то номер комнаты устаревший
          roomId = undefined;
        }
      }

      // если комнаты нет, то ищу подходящую
      if (!roomId) {
        let availableRooms = [];

        try {
          const availableRoomsResponse = await axios.get(`${__API__}/api/v1/room/available-for-join?userId=${playerId}`);
          availableRooms = availableRoomsResponse.data;
        } catch {
          // если при поиске вылетит ошибка, то значит не вышли из всех комнат
          leaveAllRooms();
        }

        roomId = availableRooms.length ? availableRooms[0].id : undefined;

        if (roomId) {
          // если нашли подходящую комнату, то заходим туда
          await axios.post(`${__API__}/api/v1/room/${roomId}/join?userId=${playerId}`);
        } else {
          // если нет - создаем и заходим
          const roomResponse = await axios.post(`${__API__}/api/v1/room/create?userId=${playerId}`);
          roomId = roomResponse.data.id;
        }
      }

      // по итогу если номер комнаты остался валидным, то присваиваю его
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
