import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './GamePage.module.scss';
import { Game } from '@/features/Game';
import { useGameState } from '@/features/Game/model/hooks/useGameState';
import { useEffect } from 'react';

import React, { useState } from "react";
import { TokenModal, TokenType } from "@/shared/ui/TokenModal";
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
  let roomId = null; // Инициализируем roomId

  useEffect(() => {
    if (roomState && roomState.id) {
      roomId = roomState.id; // Получаем ID комнаты из roomState
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



  const availableTokens: TokenType[] = [
      "NO_TAX",
      "TAKE_TWO_CHIPS",
      "OTHER_PLAYERS_PAY_ONE",
    ];

    const [myTokens, setMyTokens] = useState<TokenType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.WAITING_SECOND_USER);

    // Открываем модальное окно выбора жетонов, когда оба игрока подключены
    useEffect(() => {
      if (
        (gameStatus === GameStatus.ALL_USERS_JOINED || gameStatus === GameStatus.ALL_USERS_CONNECTED) &&
        myTokens.length === 0
      ) {
        setIsModalOpen(true);
      }
    }, [gameStatus, myTokens.length]);

    const handleSelectTokens = (tokens: TokenType[]) => {
      setMyTokens(tokens);
      setIsModalOpen(false);
      console.log("Выбраны жетоны:", tokens);
      // TODO: отправка выбранных жетонов на сервер
    };

    // Пример имитации изменения статуса игры (на практике приходит от сервера)
    useEffect(() => {
      const timer = setTimeout(() => {
        setGameStatus(GameStatus.ALL_USERS_JOINED);
      }, 3000);

      return () => clearTimeout(timer);
    }, []);

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
        />
      )}


      <h1>Игра Sabacc</h1>

            {gameStatus === GameStatus.WAITING_SECOND_USER && <p>Поиск противника...</p>}
            {isModalOpen && <p>Выберите свои жетоны!</p>}

            <TokenModal
              open={isModalOpen}
              availableTokens={availableTokens}
              maxSelection={3}
              onClose={() => setIsModalOpen(false)}
              onSelect={handleSelectTokens}
            />

            {myTokens.length > 0 && (
              <div>
                <h2>Ваши жетоны:</h2>
                <ul>
                  {myTokens.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
    </div>

  );
};




export default GamePage;

