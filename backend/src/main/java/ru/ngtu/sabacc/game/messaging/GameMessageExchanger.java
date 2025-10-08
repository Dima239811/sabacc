package ru.ngtu.sabacc.game.messaging;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import ru.ngtu.sabacc.gamecore.game.GameErrorDto;
import ru.ngtu.sabacc.gamecore.game.GameFinishDto;
import ru.ngtu.sabacc.gamecore.game.GameRoundDto;
import ru.ngtu.sabacc.gamecore.turn.TurnDto;
import ru.ngtu.sabacc.system.event.PlayerLeftSessionEvent;
import ru.ngtu.sabacc.system.event.SessionFinishedEvent;
import ru.ngtu.sabacc.ws.WebSocketMessageSender;

import static ru.ngtu.sabacc.constants.WebSocketApiEndpoint.*;

/**
 * @author Egor Bokov
 */
@Component
@RequiredArgsConstructor
public class GameMessageExchanger implements IGameMessageExchanger {

    private final WebSocketMessageSender socketMessageSender;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public void sendErrorMessage(GameErrorDto errorDto, IGameSession sender) {
        socketMessageSender.sendMessageToUserInSession(
                errorDto.getPlayerId(),
                sender.getSessionId(),
                WS_USER_SESSION_ERRORS_QUEUE,
                errorDto
        );
    }

    @Override
    public void sendAcceptedTurn(TurnDto turnDTO, IGameSession sender) {
        socketMessageSender.sendMessageSessionBroadcast(
                sender.getSessionId(),
                WS_ACCEPTED_TURNS_QUEUE,
                turnDTO
        );
    }

    @Override
    public void sendRoundResults(GameRoundDto roundDto, IGameSession sender) {
        socketMessageSender.sendMessageSessionBroadcast(
                sender.getSessionId(),
                WS_ROUND_RESULTS_QUEUE,
                roundDto
        );
    }

    @Override
    public void sendGameFinished(GameFinishDto finishDto, IGameSession sender) {
        socketMessageSender.sendMessageSessionBroadcast(
                sender.getSessionId(),
                WS_GAME_RESULTS_QUEUE,
                finishDto
        );
        eventPublisher.publishEvent(new SessionFinishedEvent(sender.getSessionId()));
    }

    @EventListener
    public void handlePlayerLeave(PlayerLeftSessionEvent event) {
        socketMessageSender.sendMessageSessionBroadcast(
                event.sessionId(),
                WS_GAME_RESULTS_QUEUE,
                new GameFinishDto(event.sessionId(), event.winnerId())
        );
    }
}
