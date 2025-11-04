import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const useWebSocketGame = (playerId: number | undefined, sessionId: number | undefined) => {
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!playerId || !sessionId) return;

    console.log('Создание сокета');
    const socketUrl = `/ws/game?playerId=${playerId}&sessionId=${sessionId}`;
    console.log('Создание сокета. URL SockJS:', socketUrl);
    const socket = new SockJS(socketUrl);

    const stompClient = new Client({
          webSocketFactory: () => {
            console.log('STOMP WebSocket factory called. SockJS object:', socket);
            return socket;
          },
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          debug: (msg) => console.log('STOMP debug:', msg), // лог всех handshake/сообщений
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
