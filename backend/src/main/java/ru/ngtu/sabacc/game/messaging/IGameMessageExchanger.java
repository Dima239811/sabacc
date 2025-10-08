package ru.ngtu.sabacc.game.messaging;

import ru.ngtu.sabacc.gamecore.game.GameErrorDto;
import ru.ngtu.sabacc.gamecore.game.GameFinishDto;
import ru.ngtu.sabacc.gamecore.game.GameRoundDto;
import ru.ngtu.sabacc.gamecore.turn.TurnDto;

/**
 * @author Egor Bokov
 */
public interface IGameMessageExchanger {
    void sendErrorMessage(GameErrorDto errorDto, IGameSession sender);
    void sendAcceptedTurn(TurnDto turnDto, IGameSession sender);
    void sendRoundResults(GameRoundDto roundDto, IGameSession sender);
    void sendGameFinished(GameFinishDto finishDto, IGameSession sender);
}
