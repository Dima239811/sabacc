// usePlayerTokens.ts - ОБНОВЛЕННЫЙ ВАРИАНТ С ОТЛАДКОЙ
import { useState, useEffect, useCallback } from 'react';
import { TokensTypes } from '../types/game';

export const usePlayerTokens = (roomId?: string, userId?: number) => {
  console.log('[usePlayerTokens] Вызван с:', { roomId, userId });

  const [tokens, setTokens] = useState<TokensTypes[]>([]);
  const [usedTokens, setUsedTokens] = useState<TokensTypes[]>([]);

  // Загрузка из localStorage
  useEffect(() => {
    console.log('[usePlayerTokens] useEffect загрузки', { roomId, userId });

    if (!roomId || !userId) {
      console.log('[usePlayerTokens] Пропускаем загрузку - нет roomId или userId');
      return;
    }

    const tokensKey = `tokens_${roomId}_${userId}`;
    const usedKey = `used_tokens_${roomId}_${userId}`;

    console.log('[usePlayerTokens] Ключи localStorage:', { tokensKey, usedKey });

    const savedTokens = localStorage.getItem(tokensKey);
    const savedUsedTokens = localStorage.getItem(usedKey);

    console.log('[usePlayerTokens] Данные из localStorage:', {
      savedTokens,
      savedUsedTokens
    });

    if (savedTokens) {
      try {
        const parsedTokens = JSON.parse(savedTokens);
        console.log('[usePlayerTokens] Загружены tokens:', parsedTokens);
        setTokens(parsedTokens);
      } catch (error) {
        console.error('[usePlayerTokens] Error loading tokens:', error);
      }
    }

    if (savedUsedTokens) {
      try {
        const parsedUsedTokens = JSON.parse(savedUsedTokens);
        console.log('[usePlayerTokens] Загружены usedTokens:', parsedUsedTokens);
        setUsedTokens(parsedUsedTokens);
      } catch (error) {
        console.error('[usePlayerTokens] Error loading used tokens:', error);
      }
    }
  }, [roomId, userId]);

  // Сохранение в localStorage
  const saveTokens = useCallback((newTokens: TokensTypes[]) => {
    console.log('[usePlayerTokens] saveTokens вызвана:', newTokens);

    if (!roomId || !userId) {
      console.log('[usePlayerTokens] Не могу сохранить - нет roomId или userId');
      return;
    }

    setTokens(newTokens);
    const key = `tokens_${roomId}_${userId}`;
    localStorage.setItem(key, JSON.stringify(newTokens));
    console.log('[usePlayerTokens] Сохранено в localStorage по ключу:', key);
  }, [roomId, userId]);

  const saveUsedTokens = useCallback((newUsedTokens: TokensTypes[]) => {
    console.log('[usePlayerTokens] saveUsedTokens вызвана:', newUsedTokens);

    if (!roomId || !userId) return;

    setUsedTokens(newUsedTokens);
    const key = `used_tokens_${roomId}_${userId}`;
    localStorage.setItem(key, JSON.stringify(newUsedTokens));
  }, [roomId, userId]);

  // Инициализация токенов
  const initializeTokens = useCallback((initialTokens: TokensTypes[]) => {
    console.log('[usePlayerTokens] initializeTokens ВЫЗВАНА с:', initialTokens);
    console.log('[usePlayerTokens] Текущие roomId, userId:', roomId, userId);

    if (!roomId || !userId) {
      console.error('[usePlayerTokens] Не могу инициализировать - нет roomId или userId');
      return;
    }

    saveTokens(initialTokens);
    saveUsedTokens([]);

    // Проверка сразу после сохранения
    setTimeout(() => {
      const saved = localStorage.getItem(`tokens_${roomId}_${userId}`);
      console.log('[usePlayerTokens] Проверка localStorage после initializeTokens:', saved);
    }, 0);
  }, [saveTokens, saveUsedTokens, roomId, userId]);

  // Логирование изменений состояния
  useEffect(() => {
    console.log('[usePlayerTokens] Состояние обновлено:', {
      tokens,
      usedTokens,
      availableTokens: tokens.filter(t => !usedTokens.includes(t))
    });
  }, [tokens, usedTokens]);

  const availableTokens = tokens.filter(token => !usedTokens.includes(token));

  return {
    tokens,
    usedTokens,
    availableTokens,
    initializeTokens,
    markTokenAsUsed: useCallback((token: TokensTypes) => {
      console.log('[usePlayerTokens] markTokenAsUsed вызвана для:', token);
      console.log('[usePlayerTokens] Текущие tokens перед удалением:', tokens);

      if (!roomId || !userId) return;

      // Функциональное обновление
      setTokens(prevTokens => {
        const newTokens = prevTokens.filter(t => t !== token);
        localStorage.setItem(`tokens_${roomId}_${userId}`, JSON.stringify(newTokens));
        return newTokens;
      });

      setUsedTokens(prevUsedTokens => {
        const newUsedTokens = [...prevUsedTokens, token];
        localStorage.setItem(`used_tokens_${roomId}_${userId}`, JSON.stringify(newUsedTokens));
        return newUsedTokens;
      });
    }, [roomId, userId, tokens]),
    clearTokens: useCallback(() => {
      if (!roomId || !userId) return;
      localStorage.removeItem(`tokens_${roomId}_${userId}`);
      localStorage.removeItem(`used_tokens_${roomId}_${userId}`);
      setTokens([]);
      setUsedTokens([]);
    }, [roomId, userId])
  };
};