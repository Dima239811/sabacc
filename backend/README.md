# Backend

## Запуск

Бэкенд приложения запускается командой `docker-compose up -d backend`

### Порты по умолчанию

Бэкенд : `8080` \
БД: `5432`

## Схема БД

Используется Flyway для миграций. \
Скрипты миграций можно найти [здесь](src/main/resources/db).

## Swagger

Swagger-UI доступен по ссылке [`http://localhost:8080/swagger-ui/index.html`](http://localhost:8080/swagger-ui/index.html)

## Игровое взаимодействие

### Сокет

Подключение локально: `ws://localhost:8080/game?sessionId=2&playerId=3`

PlayerId = UserId

Эндпоинты для сокета [тут](src/main/java/ru/ngtu/sabacc/constants/WebSocketApiEndpoint.java) \
Перед каждым эндпоинтом добавляется префикс `/app` 

За исключением очереди с сообщениями об ошибках (`WS_USER_SESSION_ERRORS_QUEUE`). \
Префикс будет такой: `/user/{userId}`, где userId - Id игрока

Получение текущего состояния игры: `http://localhost:8080/api/v1/room/game/current-state?sessionId=666`

### Примеры DTO

---

**[Старт игры](src/main/java/ru/ngtu/sabacc/game/messaging/dto/GameProgressDto.java)** \
Эндпоинт: `WS_GAME_PROGRESS_QUEUE` \
Статусы прогресса игры: [enum](src/main/java/ru/ngtu/sabacc/game/messaging/dto/GameProgressStatus.java)
Статусы сессии: [enum](src/main/java/ru/ngtu/sabacc/room/SessionRoomStatus.java)

```json
{
  "status": "STARTED",
  "details": {
    "sessionRoom": {
      "id": 666,
      "status": "IN_PROGRESS",
      "playerFirst": {
        "id": 0,
        "username": "string",
        "createdAt": "2024-11-11T09:26:01.074Z",
        "expireAt": "2024-11-11T09:26:01.074Z"
      },
      "playerSecond": {
        "id": 0,
        "username": "string",
        "createdAt": "2024-11-11T09:26:01.074Z",
        "expireAt": "2024-11-11T09:26:01.074Z"
      },
      "playerSecondConnected": true,
      "playerFirstConnected": true
    }
  }
}
```
---

**[Реконнект игрока](src/main/java/ru/ngtu/sabacc/game/messaging/dto/GameProgressDto.java)** \
Эндпоинт: `WS_GAME_PROGRESS_QUEUE` \
Статусы прогресса игры: [enum](src/main/java/ru/ngtu/sabacc/game/messaging/dto/GameProgressStatus.java)

```json
{
  "status": "PLAYER_RECONNECTED",
  "details": {
    "opponent": {
      "id": 0,
      "username": "string",
      "createdAt": "2024-11-11T09:26:01.074Z",
      "expireAt": "2024-11-11T09:26:01.074Z"
    }
  }
}
```
---

**[Дисконнект игрока](src/main/java/ru/ngtu/sabacc/game/messaging/dto/GameProgressDto.java)** \
Эндпоинт: `WS_GAME_PROGRESS_QUEUE` \
Статусы прогресса игры: [enum](src/main/java/ru/ngtu/sabacc/game/messaging/dto/GameProgressStatus.java)

```json
{
  "status": "PLAYER_DISCONNECTED",
  "details": {
    "opponent": {
      "id": 0,
      "username": "string",
      "createdAt": "2024-11-11T09:26:01.074Z",
      "expireAt": "2024-11-11T09:26:01.074Z"
    }
  }
}
```
---

**[Ошибка хода](src/main/kotlin/ru/ngtu/sabacc/gamecore/game/GameErrorDto.kt)** \
Эндпоинт: `WS_USER_SESSION_ERRORS_QUEUE` \
Типы ошибок: [enum](src/main/kotlin/ru/ngtu/sabacc/gamecore/game/GameErrorType.kt)
```json
{
  "sessionId": 666,
  "playerId": 777, 
  "errorType": "GAME_ON_PAUSE", // NOT_YOUR_TURN, WRONG_MOVE, NOT_ENOUGH_MONEY, TOKEN_NOT_FOUND
  "details": {}
}
```
---
DTO на ход одинаковые для этих эндпоинтов: \
`WS_ACCEPTED_TURNS_QUEUE` -> Слушать ходы подтвержденные игрой\
`WS_SESSION_TURN_INPUT` -> Отправлять ходы игрока
---

**[Спасовать](src/main/kotlin/ru/ngtu/sabacc/gamecore/turn/TurnDto.kt)** \
Типы ходов: [enum](src/main/kotlin/ru/ngtu/sabacc/gamecore/turn/TurnType.kt)
```json
{
  "sessionId": 666,
  "playerId": 777,
  "turnType": "PASS"
}
```

---

**[Использовать токен](src/main/kotlin/ru/ngtu/sabacc/gamecore/turn/TurnDto.kt)** \
Типы ходов: [enum](src/main/kotlin/ru/ngtu/sabacc/gamecore/turn/TurnType.kt) \
Типы токенов: [enum](src/main/kotlin/ru/ngtu/sabacc/gamecore/token/Token.kt)
```json
{
  "sessionId": 666,
  "playerId": 777,
  "turnType": "PLAY_TOKEN"
}
```

---

**[Взять карту](src/main/kotlin/ru/ngtu/sabacc/gamecore/turn/TurnDto.kt)** \
Типы ходов: [enum](src/main/kotlin/ru/ngtu/sabacc/gamecore/turn/TurnType.kt)
```json
{
  "sessionId": 666,
  "playerId": 777,
  "turnType": "GET_SAND" // GET_BLOOD, GET_SAND_DISCARD, GET_BLOOD_DISCARD
}
```

---

**[Сбросить карту](src/main/kotlin/ru/ngtu/sabacc/gamecore/turn/TurnDto.kt)** \
Типы ходов: [enum](src/main/kotlin/ru/ngtu/sabacc/gamecore/turn/TurnType.kt)
```json
{
  "sessionId": 666,
  "playerId": 777,
  "turnType": "DISCARD_SAND" // DISCARD_BLOOD
  "details": {
    "index": 0 // 1
  }
}
```

---

**[Ожидание кубика](src/main/kotlin/ru/ngtu/sabacc/gamecore/turn/TurnDto.kt)** \
!!! Может прийти только на эдпоинт `WS_ACCEPTED_TURNS_QUEUE` \
Типы ходов: [enum](src/main/kotlin/ru/ngtu/sabacc/gamecore/turn/TurnType.kt)
```json
{
  "sessionId": 666,
  "playerId": 777,
  "turnType": "AWAITING_DICE",
  "details": {
    "first": 1,
    "second": 6
  }
}
```

---

**[Выбор кубика](src/main/kotlin/ru/ngtu/sabacc/gamecore/turn/TurnDto.kt)** \
Типы ходов: [enum](src/main/kotlin/ru/ngtu/sabacc/gamecore/turn/TurnType.kt)
```json
{
  "sessionId": 666,
  "playerId": 777,
  "turnType": "SELECT_DICE",
  "details": {
    "index": 0 // 1
  }
}
```

---

Только для прослушки! \
Эндпоинт для результатов раунда: `WS_ROUND_RESULTS_QUEUE` \
Эндпоинт для результатов игры: `WS_GAME_RESULTS_QUEUE`

---

**[Результат раунда](src/main/kotlin/ru/ngtu/sabacc/gamecore/game/GameRoundDto.kt)** \
Типы токенов: [enum](src/main/kotlin/ru/ngtu/sabacc/gamecore/token/Token.kt)
Типы токенов: [enum](src/main/kotlin/ru/ngtu/sabacc/gamecore/card/Card.kt)

```json
{
  "round": 1,
  "players": [
    {
      "tokens": [
        "NO_TAX",
        "TAKE_TWO_CHIPS"
      ],
      "remainChips": 4,
      "spentChips": 0,
      "bloodCards": [
        {
          "cardValueType": "VALUE_CARD",
          "value": 4
          // Only for value cards
        }
      ],
      "sandCards": [
        {
          "cardValueType": "SYLOP"
        }
      ],
      "handRating": [0, 4]
    },
    {
      "tokens": [
        "OTHER_PLAYERS_PAY_ONE"
      ],
      "remainChips": 3,
      "spentChips": 1,
      "bloodCards": [
        {
          "cardValueType": "SYLOP"
        }
      ],
      "sandCards": [
        {
          "cardValueType": "SYLOP"
        }
      ],
      "handRating": [0, 0]
    }
  ]
}
```

---

**[Результат игры](src/main/kotlin/ru/ngtu/sabacc/gamecore/game/GameFinishDto.kt)**

```json
{
  "sessionId": 666,
  "winnerId": 777
}
```
