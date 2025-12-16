import React, { useState, useCallback, useEffect } from "react";
import { useSelector } from 'react-redux';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './GamePage.module.scss';
import { Game } from '@/features/Game';
import { useGameState } from '@/features/Game/model/hooks/useGameState';
import { GameStatus, TokensTypes } from "@/features/Game/model/types/game";
import { selectCurrentUser } from '@/features/Auth';

import imgNoTax from '@/shared/assets/images/free_raffle.png';
import imgEmbezzlement from '@/shared/assets/images/embezzlement.png';
import imgImmunity from '@/shared/assets/images/immunity.png';
import imgExhaustion from '@/shared/assets/images/exhaustion.png';
import imgExtraRefund from '@/shared/assets/images/extra_refund.png';
import imgGeneralTariff from '@/shared/assets/images/general_tariff.png';
import imgImposters from '@/shared/assets/images/major_fraud.png';
import imgGeneralAudit from '@/shared/assets/images/general_audit.png';
import imgEmbargo from '@/shared/assets/images/embargo.png';
import imgSylopZero from '@/shared/assets/images/devalue.png';
import imgDirectTransaction from '@/shared/assets/images/direct_transaction.png';
import imgTakeTwoChips from '@/shared/assets/images/refund.png';
import imgCookBooks from '@/shared/assets/images/cook_books.png';

const tokenData = [
  { id: 'Бесплатный розыгрыш', name: 'Бесплатный розыгрыш', description: 'Вы не уплачиваете налог в этом ходе', frontImage: imgNoTax, backImage: imgNoTax },
  { id: 'Хищение', name: 'Хищение', description: 'Заберите 1 фишку из банка соперника в свой банк', frontImage: imgEmbezzlement, backImage: imgEmbezzlement },
  { id: 'Иммунитет', name: 'Иммунитет', description: 'Предотвращает срабатывание жетонов против вас до следующего раунда', frontImage: imgImmunity, backImage: imgImmunity },
  { id: 'Истощение', name: 'Истощение', description: 'Противник должен сбросить карты и взять новую комбинацию из закрытой колоды', frontImage: imgExhaustion, backImage: imgExhaustion },
  { id: 'Доп возврат', name: 'Доп возврат', description: 'Верните 3 фишки, выплаченные в этом раунде', frontImage: imgExtraRefund, backImage: imgExtraRefund },
  { id: 'Общий тариф', name: 'Общий тариф', description: 'С противника взимается налог 1 фишка', frontImage: imgGeneralTariff, backImage: imgGeneralTariff },
  { id: 'Крупное мошенничество', name: 'Крупное мошенничество', description: 'Установить значение самозванца равным 6 до следующего вскрытия', frontImage: imgImposters, backImage: imgImposters },
  { id: 'Общий аудит', name: 'Общий аудит', description: 'Соперник облагается налогом в 2 фишки, если он спасовал в этом ходе', frontImage: imgGeneralAudit, backImage: imgGeneralAudit },
  { id: 'Эмбарго', name: 'Эмбарго', description: 'Противник в следующем ходе пасует', frontImage: imgEmbargo, backImage: imgEmbargo },
  { id: 'Уценка', name: 'Уценка', description: 'Установить значение Sylop равным 0 до следующего вскрытия', frontImage: imgSylopZero, backImage: imgSylopZero },
  { id: 'Прямая транзакция', name: 'Прямая транзакция', description: 'Противник меняется с вами картами', frontImage: imgDirectTransaction, backImage: imgDirectTransaction },
  { id: 'Возврат', name: 'Возврат', description: 'Верните 2 фишки ', frontImage: imgTakeTwoChips, backImage: imgTakeTwoChips },
  { id: 'Готовьте книги', name: 'Готовьте книги', description: 'Инвертируйте ранги Sabacc до следующего вскрытия', frontImage: imgCookBooks, backImage: imgCookBooks },
];

const tokenNameToEnum: Record<string, TokensTypes> = {
  "Бесплатный розыгрыш": TokensTypes.NO_TAX,
  "Возврат": TokensTypes.TAKE_TWO_CHIPS,
  "Общий тариф": TokensTypes.OTHER_PLAYERS_PAY_ONE,
  "Доп возврат": TokensTypes.EXTRA_REFUND,
  "Хищение": TokensTypes.EMBEZZLEMENT,
  "Общий аудит": TokensTypes.GENERAL_AUDIT,
  "Иммунитет": TokensTypes.IMMUNITY,
  "Истощение": TokensTypes.EXHAUSTION,
  "Прямая транзакция": TokensTypes.DIRECT_TRANSACTION,
  "Крупное мошенничество": TokensTypes.IMPOSTERS_TO_SIX,
  "Уценка": TokensTypes.SYLOP_TO_ZERO,
  "Готовьте книги": TokensTypes.COOK_THE_BOOKS,
  "Эмбарго": TokensTypes.EMBARGO,
};

const makeSelectedKey = (roomId: number | undefined, userId: string | number | undefined) =>
  roomId != null && userId != null ? `selectedTokens_room_${roomId}_user_${userId}` : null;
const makeUsedKey = (roomId: number | undefined, userId: string | number | undefined) =>
  roomId != null && userId != null ? `usedTokens_room_${roomId}_user_${userId}` : null;

const GamePage: React.FC = () => {
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

  const currentUser = useSelector(selectCurrentUser);

  let loader = null;
  if (!client) loader = <div className={classNames(cls.loader, {}, [])}>Подключение к серверу</div>;
  else if (!roomState) loader = <div className={classNames(cls.loader, {}, [])}>Создание комнаты...</div>;
  else if (roomState.status === 'WAITING_SECOND_USER') loader = <div className={classNames(cls.loader, {}, [])}>Ожидание соперника...</div>;
  else if (!gameState) loader = <div className={classNames(cls.loader, {}, [])}>Игра ещё не создана или не стартовала</div>;
  else if (isLoading && !isGameInProgress) loader = <div className={classNames(cls.loader, {}, [])}>Ожидание соперника...</div>;

  const [usedTokens, setUsedTokens] = useState<TokensTypes[]>([]);
  const [myTokens, setMyTokens] = useState<TokensTypes[]>([]);
  const [hasSelectedTokens, setHasSelectedTokens] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.WAITING_SECOND_USER);
  const [flippedTokens, setFlippedTokens] = useState<string[]>([]);

  // NEW: tracks how many tokens player used in the current turn (max 1)
  const [tokensUsedThisTurn, setTokensUsedThisTurn] = useState<number>(0);
  // NEW: error modal state (title + message)
  const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);

  // Prefer authenticated redux user id, fallback to client.userId (normalized)
  const normalizedUserId = React.useMemo(() => {
    if (currentUser?.id != null) return String(currentUser.id);
    // @ts-ignore client.userId may be string/number/undefined; normalize to string if present
    if (typeof client?.userId !== 'undefined' && client?.userId !== null) {
      // @ts-ignore
      const s = String(client.userId);
      const m = s.match(/(\d+)/);
      return m ? m[0] : s;
    }
    return undefined;
    // @ts-ignore
  }, [currentUser, client?.userId]);

  // Load persisted selection / used tokens when room or user changes
  useEffect(() => {
    const roomId = roomState?.id;
    const userId = normalizedUserId;
    const selKey = makeSelectedKey(roomId, userId);
    const uKey = makeUsedKey(roomId, userId);

    console.log('[GamePage] load keys', { roomId, userId, selKey, uKey });

    if (!roomId || !userId) {
      setMyTokens([]);
      setUsedTokens([]);
      setHasSelectedTokens(false);
      setIsModalOpen(false);
      return;
    }

    // Load selected tokens for this room & user
    try {
      const saved = selKey ? localStorage.getItem(selKey) : null;
      if (saved) {
        const parsed = JSON.parse(saved) as TokensTypes[];
        setMyTokens(parsed);
        setHasSelectedTokens(true);
        setIsModalOpen(false);
      } else {
        setHasSelectedTokens(false);
      }
    } catch (e) {
      console.warn('Ошибка парсинга сохранённых жетонов', e);
      setHasSelectedTokens(false);
    }

    // Load used tokens
    try {
      const savedUsed = uKey ? localStorage.getItem(uKey) : null;
      if (savedUsed) {
        const parsedUsed = JSON.parse(savedUsed) as TokensTypes[];
        setUsedTokens(parsedUsed);
      } else {
        setUsedTokens([]);
      }
    } catch (e) {
      console.warn('Ошибка парсинга usedTokens', e);
      setUsedTokens([]);
    }
  }, [roomState?.id, normalizedUserId]);

  // If server provides player's tokens and it's exactly 3 tokens (confirmed selection),
  // adopt them — otherwise ignore because server may be returning full token pool.
  useEffect(() => {
    if (!gameState) return;
    if (!normalizedUserId) return;
    const selKey = makeSelectedKey(roomState?.id, normalizedUserId);
    if (selKey && localStorage.getItem(selKey)) return;

    const myPlayer = gameState.players.find(p => String(p.playerId) === String(normalizedUserId));
    if (myPlayer && Array.isArray(myPlayer.tokens) && myPlayer.tokens.length === 3) {
      console.log('[GamePage] adopting server-provided confirmed tokens:', myPlayer.tokens);
      setMyTokens(myPlayer.tokens as TokensTypes[]);
      setHasSelectedTokens(true);
      setIsModalOpen(false);
      // persist server-provided confirmed selection so refresh keeps it
      try {
        selKey && localStorage.setItem(selKey, JSON.stringify(myPlayer.tokens));
      } catch (e) {
        console.warn('Не удалось сохранить серверные токены в localStorage', e);
      }
    } else if (myPlayer && Array.isArray(myPlayer.tokens) && myPlayer.tokens.length > 0) {
      // Ignore server-provided token lists that are not a confirmed 3-item selection.
      console.log('[GamePage] сервер вернул токены, но это не подтверждённый выбор (игроку не 3 жетона) — игнорируем сохранение:', myPlayer.tokens);
    }
  }, [gameState, normalizedUserId, roomState?.id]);

  // RESET tokensUsedThisTurn when turns change: if it's our turn reset counter
  useEffect(() => {
    const currentPlayerId = gameState?.currentPlayerId;
    if (currentPlayerId == null) return;

    if (normalizedUserId && Number(currentPlayerId) === Number(normalizedUserId)) {
      // our turn started
      setTokensUsedThisTurn(0);
    }
    // also reset when turn moves away from us to be safe
    // (this ensures strange multi-increment issues are cleared)
    if (normalizedUserId && Number(currentPlayerId) !== Number(normalizedUserId)) {
      setTokensUsedThisTurn(0);
    }
  }, [gameState?.currentPlayerId, normalizedUserId]);

  // Open token selection modal only if player hasn't selected yet
  useEffect(() => {
    if (!hasSelectedTokens && (gameStatus === GameStatus.ALL_USERS_JOINED || gameStatus === GameStatus.ALL_USERS_CONNECTED)) {
      setIsModalOpen(true);
    }
  }, [gameStatus, hasSelectedTokens]);

  // Demo status change (real app should use server events)
  useEffect(() => {
    const timer = setTimeout(() => setGameStatus(GameStatus.ALL_USERS_JOINED), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectTokens = (tokens: TokensTypes[]) => {
    // Ensure we have userId and roomId before persisting
    const roomId = roomState?.id;
    const userId = normalizedUserId;
    const selKey = makeSelectedKey(roomId, userId);

    if (!roomId || !userId) {
      alert('Не удалось определить пользователя или комнату. Повторите попытку немного позже.');
      return;
    }

    setMyTokens(tokens);
    setIsModalOpen(false);
    setHasSelectedTokens(true);

    try {
      selKey && localStorage.setItem(selKey, JSON.stringify(tokens));
    } catch (e) {
      console.warn('Не удалось сохранить selectedTokens', e);
    }

    if (client) {
      // @ts-ignore client.send may exist
      client.send && client.send(JSON.stringify({ action: "SELECT_TOKENS", payload: { tokens } }));
    }
  };

  // Handle playing a token: enforce it's our turn and at most 1 token per turn.
  const handlePlayToken = useCallback((token: TokensTypes) => {
    const myId = normalizedUserId ? Number(normalizedUserId) : undefined;
    const currentPlayerId = gameState?.currentPlayerId;

    // Check turn
    if (myId == null || currentPlayerId == null || myId !== Number(currentPlayerId)) {
      setErrorModal({
        title: 'Нельзя сыграть жетон сейчас',
        message: 'Жетон можно использовать только в свой ход. Подождите, пока будет ваш ход.',
      });
      return;
    }

    // enforce at most 1 token per turn
    if (tokensUsedThisTurn >= 1) {
      setErrorModal({
        title: 'Нельзя сыграть больше одного жетона за ход',
        message: 'Вы уже использовали жетон в этом ходе. Подождите следующий ход.',
      });
      return;
    }

    if (usedTokens.includes(token)) {
      setErrorModal({
        title: 'Жетон уже использован',
        message: 'Этот жетон уже был использован ранее и недоступен.',
      });
      return;
    }

    const roomId = roomState?.id;
    const userId = normalizedUserId;
    const uKey = makeUsedKey(roomId, userId);

    // increment per-turn counter immediately to avoid race double-clicks
    setTokensUsedThisTurn(prev => prev + 1);

    setUsedTokens(prev => {
      const next = [...prev, token];
      try {
        uKey && localStorage.setItem(uKey, JSON.stringify(next));
      } catch (e) {
        console.warn('Не удалось сохранить usedTokens', e);
      }
      return next;
    });

    setMyTokens(prev => prev.filter(t => t !== token));

    if (client && roomState) {
      client.publish({
        destination: `/app/input/session/${roomState.id}/turn`,
        body: JSON.stringify({
          sessionId: roomState.id,
          // @ts-ignore
          playerId: normalizedUserId ? Number(normalizedUserId) : undefined,
          turnType: 'PLAY_TOKEN',
          details: { token }
        }),
      });
    }
  }, [client, roomState, usedTokens, normalizedUserId, tokensUsedThisTurn, gameState?.currentPlayerId]);

  const handleCardClick = (tokenId: string) => {
    const enumValue = tokenNameToEnum[tokenId];
    if (!enumValue) return;
    setFlippedTokens(prev => prev.includes(tokenId) ? prev.filter(id => id !== tokenId) : [...prev, tokenId]);
  };

  const handleIconClick = (tokenId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const enumValue = tokenNameToEnum[tokenId];
    if (!enumValue) return;
    if (usedTokens.includes(enumValue)) return;
    if (myTokens.includes(enumValue)) setMyTokens(prev => prev.filter(t => t !== enumValue));
    else {
      if (myTokens.length < 3) setMyTokens(prev => [...prev, enumValue]);
      else alert("Можно выбрать только 3 жетона!");
    }
  };

  useEffect(() => {
    console.log('[GamePage] myTokens updated:', myTokens, 'hasSelectedTokens:', hasSelectedTokens, 'tokensUsedThisTurn:', tokensUsedThisTurn, 'currentPlayerId:', gameState?.currentPlayerId);
  }, [myTokens, hasSelectedTokens, tokensUsedThisTurn, gameState?.currentPlayerId]);

  return (
    <div className={classNames(cls.game, {}, [])}>
      {roomState?.id && <div className={cls.roomId}>ID Комнаты: {roomState.id}</div>}

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
          // @ts-ignore
          userId={normalizedUserId ? Number(normalizedUserId) : undefined}
          onPlayToken={handlePlayToken}
        />
      )}

      {gameStatus === GameStatus.WAITING_SECOND_USER && <p>Поиск противника...</p>}

      {isModalOpen && (
        <div className={cls.modalOverlay}>
          <div className={cls.tokenModal}>
            <div className={cls.modalHeader}>
              <h2>Выберите жетоны для игры</h2>
              <div className={cls.selectionCounter}>Выбрано: {myTokens.length}/3</div>
            </div>

            <div className={cls.tokensGrid}>
              {tokenData
                .filter(token => {
                  const enumValue = tokenNameToEnum[token.id];
                  return !usedTokens.includes(enumValue);
                })
                .map((token) => (
                  <div
                    key={token.id}
                    className={classNames(cls.tokenCard, { [cls.flipped]: flippedTokens.includes(token.id) })}
                    onClick={() => handleCardClick(token.id)}
                  >
                    <div className={cls.tokenCardInner}>
                      <div className={cls.tokenCardFront}>
                        <img src={token.frontImage} alt={token.name} />
                        <div className={cls.tokenName}>{token.name}</div>
                        <div className={cls.tokenIcon} onClick={(e) => handleIconClick(token.id, e)}>
                          {myTokens.includes(tokenNameToEnum[token.id]) ? '🗑' : '➕'}
                        </div>
                      </div>

                      <div className={cls.tokenCardBack}>
                        <img src={token.frontImage} alt={token.name} />
                        <div className={cls.tokenDescription}><p>{token.description}</p></div>
                        <div className={cls.tokenIcon} onClick={(e) => handleIconClick(token.id, e)}>
                          {myTokens.includes(tokenNameToEnum[token.id]) ? '🗑' : '➕'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className={cls.modalActions}>
              <button
                className={cls.confirmButton}
                onClick={() => {
                  if (myTokens.length === 3) handleSelectTokens(myTokens);
                }}
                disabled={myTokens.length !== 3 || !normalizedUserId}
                title={!normalizedUserId ? 'Не удалось определить пользователя, подождите...' : ''}
              >
                Подтвердить выбор ({myTokens.length}/3)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error modal (styled) */}
      {errorModal && (
        <div className={cls.modalOverlay}>
          <div className={cls.errorModal}>
            <div className={cls.errorTitle}>{errorModal.title}</div>
            <div className={cls.errorMessage}>{errorModal.message}</div>
            <div className={cls.errorActions}>
              <button className={cls.confirmButton} onClick={() => setErrorModal(null)}>Понятно</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;