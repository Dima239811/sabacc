import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './GamePage.module.scss';
import { Game } from '@/features/Game';
import { useGameState } from '@/features/Game/model/hooks/useGameState';

import React, { useState, useCallback, useEffect } from "react";
import { TokensTypes } from "../features/Game/model/types/game.ts";
import { GameStatus } from "@/features/Game/model/types/game";

const GamePage = () => {
  const {
    client,
    gameState,
    roomState,
    isLoading,
    isGameInProgress,
    diceDetails,
    handleDiceSelection,
    winnerId,
    roundResult,
    leaveCurrentRoom,
    fetchGameState,
  } = useGameState();

  let loader = null;
  let roomId = null;

  useEffect(() => {
    if (roomState && roomState.id) {
      roomId = roomState.id;
    }
  }, [roomState]);

  if (!client) {
    loader = <div className={classNames(cls.loader, {}, [])}>Подключение к серверу</div>;
  } else if (!roomState) {
    loader = <div className={classNames(cls.loader, {}, [])}>Создание комнаты...</div>;
  } else if (roomState.status === 'WAITING_SECOND_USER') {
    loader = <div className={classNames(cls.loader, {}, [])}>Ожидание соперника...</div>;
  } else if (!gameState) {
    loader = <div className={classNames(cls.loader, {}, [])}>Игра ещё не создана или не стартовала</div>;
  } else if (isLoading && !isGameInProgress) {
    loader = <div className={classNames(cls.loader, {}, [])}>Ожидание соперника...</div>;
  }

const [usedTokens, setUsedTokens] = useState<TokensTypes[]>([]);

  const [myTokens, setMyTokens] = useState<TokensTypes[]>([]);
  const [hasSelectedTokens, setHasSelectedTokens] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.WAITING_SECOND_USER);
  const [flippedTokens, setFlippedTokens] = useState<string[]>([]);


    useEffect(() => {
            if (!gameState || !client) return;
            const myUserId = client?.userId;
            if (typeof myUserId === 'undefined') return;

            const myPlayer = gameState.players.find(p => p.playerId === myUserId);
            if (myPlayer && Array.isArray(myPlayer.tokens) && myPlayer.tokens.length > 0) {
              // предполагается, что gameState.players[].tokens уже содержит значения типа TokensTypes (строки enum)
              setMyTokens(myPlayer.tokens as TokensTypes[]);
              setHasSelectedTokens(true);
              setIsModalOpen(false); // закрываем окно выбора если оно вдруг открылось
            }
          }, [gameState, client]);



  // Открываем модальное окно выбора жетонов, когда оба игрока подключены
  useEffect(() => {
    if (
      !hasSelectedTokens &&
      (gameStatus === GameStatus.ALL_USERS_JOINED ||
       gameStatus === GameStatus.ALL_USERS_CONNECTED)
    ) {
      setIsModalOpen(true);
    }
  }, [gameStatus, hasSelectedTokens]);

  const handleSelectTokens = (tokens: TokensTypes[]) => {
    setMyTokens(tokens);
    setIsModalOpen(false);
    console.log("Выбраны жетоны:", tokens);
    if (client) {
      client.send(JSON.stringify({
        action: "SELECT_TOKENS",
        payload: { tokens }
      }));
    }
  };



  const handlePlayToken = useCallback((token: TokensTypes) => {

      if (usedTokens.includes(token)) {
          alert('Этот жетон уже был использован!');
          return; // выходим, чтобы не отправлять повторно
        }

      // оптимистично удаляем жетон из локального состояния
      setUsedTokens(prev => [...prev, token]);




      // отправляем событие на сервер (сервер должен удалить токен у игрока и разослать обновлённый gameState)
      if (client) {
        client.publish
          ? client.publish({
              destination: `/app/input/session/${roomState!.id}/turn`,
              body: JSON.stringify({
                sessionId: roomState!.id,
                playerId: client?.userId, // возможно у вас другой способ
                turnType: 'PLAY_TOKEN',
                details: { token }
              }),
            })
          : client.send(JSON.stringify({
              action: "PLAY_TOKEN",
              payload: { token }
            }));
      }
    }, [client, roomState]);


  // Пример имитации изменения статуса игры (на практике приходит от сервера)
  useEffect(() => {
    const timer = setTimeout(() => {
      setGameStatus(GameStatus.ALL_USERS_JOINED);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleCardClick = (tokenId: string) => {
    // Переворачиваем карточку при клике на карточку (но не на иконку)
    setFlippedTokens(prev =>
      prev.includes(tokenId)
        ? prev.filter(id => id !== tokenId)
        : [...prev, tokenId]
    );
  };


  useEffect(() => {
      console.log('[GamePage] myTokens updated:', myTokens, 'hasSelectedTokens:', hasSelectedTokens);
    }, [myTokens, hasSelectedTokens]);


  const handleIconClick = (tokenId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Останавливаем всплытие, чтобы карточка не переворачивалась

    // Обрабатываем выбор/отмену выбора
    if (myTokens.includes(tokenId)) {
      // Убираем из выбранных
      setMyTokens(prev => prev.filter(id => id !== tokenId));
    } else {
      // Добавляем в выбранные, если не превышен лимит
      if (myTokens.length < 3) {
        setMyTokens(prev => [...prev, tokenId]);
      } else {
        alert('Можно выбрать только 3 жетона!');
      }
    }
  };



  const tokenData = [
    {
        id: 'Бесплатный розыгрыш',
        name: 'Бесплатный розыгрыш',
        description: 'Вы не уплачиваете налог в этом ходе',
        frontImage: '/src/shared/assets/images/Бесплатный розыгрыш.png',
        backImage: '/src/shared/assets/images/Бесплатный розыгрыш.png'
      },
    { id: 'Хищение', name: 'Хищение', description: 'Заберите 1 фишку из банка соперника в свой банк', frontImage: '/src/shared/assets/images/Хищение.png', backImage: '/src/shared/assets/images/Хищение.png' },
    { id: 'Иммунитет', name: 'Иммунитет', description: 'Предотвращает срабатывание жетонов против вас до следующего раунда', frontImage: '/src/shared/assets/images/Иммунитет.png', backImage: '/src/shared/assets/images/Иммунитет.png' },
    { id: 'Истощение', name: 'Истощение', description: 'Противник должен сбросить карты и взять новую комбинацию из закрытой колоды', frontImage: '/src/shared/assets/images/Истощение.png', backImage: '/src/shared/assets/images/Истощение.png' },
    { id: 'Доп возврат', name: 'Доп возврат', description: 'Верните 3 фишки, выплаченные в этом раунде', frontImage: '/src/shared/assets/images/Доп возврат.png', backImage: '/src/shared/assets/images/Доп возврат.png' },
    { id: 'Общий тариф', name: 'Общий тариф', description: 'С противника взимается налог 1 фишка', frontImage: '/src/shared/assets/images/Общий тариф.png', backImage: '/src/shared/assets/images/Общий тариф.png' },
    { id: 'Крупное мошенничество', name: 'Крупное мошенничество', description: 'Установить значение самозванца равным 6 до следующего вскрытия', frontImage: '/src/shared/assets/images/Крупное мошенничество.png', backImage: '/src/shared/assets/images/Крупное мошенничество.png' },
    { id: 'Общий аудит', name: 'Общий аудит', description: 'Соперник облагается налогом в 2 фишки, если он спасовал в этом ходе', frontImage: '/src/shared/assets/images/Общий аудит.png', backImage: '/src/shared/assets/images/Общий аудит.png' },
    { id: 'Эмбарго', name: 'Эмбарго', description: 'Противник в следующем ходе пасует', frontImage: '/src/shared/assets/images/Эмбарго.png', backImage: '/src/shared/assets/images/Эмбарго.png' },
    { id: 'Уценка', name: 'Уценка', description: 'Установить значение Sylop равным 0 до следующего вскрытия', frontImage: '/src/shared/assets/images/Уценка.png', backImage: '/src/shared/assets/images/Уценка.png' },
    { id: 'Прямая транзакция', name: 'Прямая транзакция', description: 'Противник меняется с вами картами', frontImage: '/src/shared/assets/images/Прямая транзакция.png', backImage: '/src/shared/assets/images/Прямая транзакция.png' },
    { id: 'Возврат', name: 'Возврат', description: 'Верните 2 фишки ', frontImage: '/src/shared/assets/images/Возврат.png', backImage: '/src/shared/assets/images/Возврат.png' },
    { id: 'Готовьте книги', name: 'Готовьте книги', description: 'Инвертируйте ранги Sabacc до следующего вскрытия', frontImage: '/src/shared/assets/images/Готовьте книги.png', backImage: '/src/shared/assets/images/Готовьте книги.png' },

  ];

  return (
      <div className={classNames(cls.game, {}, [])}>
        {/* Отображаем ID комнаты, если он есть */}
        {roomState?.id && (
          <div className={cls.roomId}>
            ID Комнаты: {roomState.id}
          </div>
        )}

        {loader ? (
          loader
        ) : (
          <Game
            client={client}
            gameState={gameState}
            roomState={roomState}
            diceDetails={diceDetails}
            handleDiceSelection={handleDiceSelection}
            winnerId={winnerId}
            roundResult={roundResult}
            leaveCurrentRoom={leaveCurrentRoom}
            fetchGameState={fetchGameState}

            myTokens={myTokens.filter(t => !usedTokens.includes(t))}
            userId={client?.userId}
            onPlayToken={handlePlayToken}
          />
        )}



        {gameStatus === GameStatus.WAITING_SECOND_USER && <p>Поиск противника...</p>}

        {isModalOpen && (
          <div className={cls.modalOverlay}>
            <div className={cls.tokenModal}>
              <div className={cls.modalHeader}>
                <h2>Выберите жетоны для игры</h2>
                <div className={cls.selectionCounter}>
                  Выбрано: {myTokens.length}/3
                </div>

              </div>

              <div className={cls.tokensGrid}>
                {tokenData.map((token) => (
                  <div
                    key={token.id}
                    className={classNames(cls.tokenCard, { [cls.flipped]: flippedTokens.includes(token.id) })}
                    onClick={() => handleCardClick(token.id)}
                  >
                    <div className={cls.tokenCardInner}>
                      {/* Лицевая сторона */}
                      <div className={cls.tokenCardFront}>
                        <img src={token.frontImage} alt={token.name} />
                        <div className={cls.tokenName}>{token.name}</div>
                        <div
                          className={cls.tokenIcon}
                          onClick={(e) => handleIconClick(token.id, e)}
                        >
                          {myTokens.includes(token.id) ? '🗑' : '➕'}
                        </div>
                      </div>

                      {/* Обратная сторона */}
                      <div className={cls.tokenCardBack}>
                        <img src={token.frontImage} alt={token.name} />
                        <div className={cls.tokenDescription}>

                          <p>{token.description}</p>
                        </div>
                        <div
                          className={cls.tokenIcon}
                          onClick={(e) => handleIconClick(token.id, e)}
                        >
                          {myTokens.includes(token.id) ? '🗑' : '➕'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={cls.modalActions}>
                <button
                  className={cls.confirmButton}
                  onClick={() => setIsModalOpen(false)}
                  disabled={myTokens.length != 3}
                >
                  Подтвердить выбор ({myTokens.length}/3)
                </button>
              </div>
            </div>
          </div>
        )}


      </div>
    );
  };

export default GamePage;