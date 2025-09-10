package ru.ngtu.sabacc.ws;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import static ru.ngtu.sabacc.constants.WebSocketApiEndpoint.*;

/**
 * @author Egor Bokov
 */
@Slf4j
@ConditionalOnProperty(
        value = "websocket.logging",
        havingValue = "true"
)
@Controller
public class WebSocketLoggingController {

//    @MessageMapping(WS_SESSION_TURN_INPUT)
//    public void logSessionTurnInput(String payload, SimpMessageHeaderAccessor headerAccessor) {
//        logMessage(payload, headerAccessor);
//    }

    @MessageMapping(WS_SESSION_CHAT_INPUT)
    public void logSessionChatInput(String payload, SimpMessageHeaderAccessor headerAccessor) {
        logMessage(payload, headerAccessor);
    }

    @MessageMapping(WS_SESSION_CHAT_QUEUE)
    public void logSessionChatQueue(String payload, SimpMessageHeaderAccessor headerAccessor) {
        logMessage(payload, headerAccessor);
    }

    @MessageMapping(WS_SESSION_CHAT_TOPIC)
    public void logSessionChatTopic(String payload, SimpMessageHeaderAccessor headerAccessor) {
        logMessage(payload, headerAccessor);
    }

    @MessageMapping(WS_ACCEPTED_TURNS_QUEUE)
    public void logAcceptedTurnsQueue(String payload, SimpMessageHeaderAccessor headerAccessor) {
        logMessage(payload, headerAccessor);
    }

    @MessageMapping(WS_ROUND_RESULTS_QUEUE)
    public void logRoundResultsQueue(String payload, SimpMessageHeaderAccessor headerAccessor) {
        logMessage(payload, headerAccessor);
    }

    @MessageMapping(WS_GAME_RESULTS_QUEUE)
    public void logGameResultsQueue(String payload, SimpMessageHeaderAccessor headerAccessor) {
        logMessage(payload, headerAccessor);
    }

    // User specific endpoints not loggable
//    @MessageMapping(WS_USER_SESSION_ERRORS_QUEUE)
//    public void logUserSessionErrorsQueue(String payload, SimpMessageHeaderAccessor headerAccessor) {
//        logMessage(payload, headerAccessor);
//    }

    private void logMessage(String payload, SimpMessageHeaderAccessor headerAccessor) {
        String destination = headerAccessor.getDestination();
        log.info("WS message: [{}] {}", destination, payload);
    }
}
