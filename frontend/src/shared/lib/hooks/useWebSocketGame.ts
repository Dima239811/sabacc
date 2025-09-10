import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const useWebSocketGame = (playerId: number | undefined, sessionId: number | undefined) => {
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!playerId || !sessionId) return;

    console.log('Создание сокета');
    const socket = new SockJS(`${__API__}/game?playerId=${playerId}&sessionId=${sessionId}`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (msg) => console.log('WebSocket:', msg),
      onConnect: () => console.log('WebSocket connected'),
      onDisconnect: () => console.log('WebSocket disconnected'),
      onStompError: (frame) => console.error('WebSocket error:', frame),
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [playerId, sessionId]);

  return client;
};
