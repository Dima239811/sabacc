package ru.ngtu.sabacc.game.messaging;

import ru.ngtu.sabacc.gamecore.game.GameStateDto;
import ru.ngtu.sabacc.gamecore.turn.TurnDto;

/**
 * @author Egor Bokov
 */
public interface IGameSession {
    GameStateDto getCurrentState();
    void tryMakeTurn(TurnDto turnDTO);
    Long getSessionId();
    void start();
    void pause();
    void unpause();
}
