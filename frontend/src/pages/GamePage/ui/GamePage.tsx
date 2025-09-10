import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './GamePage.module.scss';
import { Game } from '@/features/Game';
import { useGameState } from '@/features/Game/model/hooks/useGameState';

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
    fetchGameState
  } = useGameState();

  let loader = null
  if (!client) loader = <div className={classNames(cls.loader, {}, [])}>Проблема с вебсокетом</div>;
  else if (!roomState) loader = <div className={classNames(cls.loader, {}, [])}>Создание комнаты</div>;
  else if (!gameState) loader = <div className={classNames(cls.loader, {}, [])}>Игра еще не создана - ожидайте соперника</div>;
  else if (isLoading || !isGameInProgress) loader = <div className={classNames(cls.loader, {}, [])}>Ожидание соперника...</div>

  return (
    <div className={classNames(cls.game, {}, [])}>
      {loader ||
        <Game
          client={client!}
          gameState={gameState!}
          roomState={roomState}
          diceDetails={diceDetails}
          handleDiceSelection={handleDiceSelection}
          winnerId={winnerId!} // Передаем ID победителя
          roundResult={roundResult} // Передаем результаты раунда
          leaveCurrentRoom={leaveCurrentRoom}
          fetchGameState={fetchGameState}
        />
      }
    </div>
  );
};

export default GamePage;
