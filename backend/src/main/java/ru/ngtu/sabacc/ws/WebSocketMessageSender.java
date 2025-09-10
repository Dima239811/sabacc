package ru.ngtu.sabacc.ws;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import static ru.ngtu.sabacc.constants.WebSocketApiEndpoint.SESSION_ID;

/**
 * @author Egor Bokov
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketMessageSender {
    private final SimpMessagingTemplate messagingTemplate;

    public void sendMessageToUserInSession(Long userId, Long sessionId, String destination, Object payload) {
        String replacedDestination = destination.replace(SESSION_ID, sessionId.toString());
        log.debug("WS: [{}] sending message to user in session: sessionId={}, userId={}, payload={}", destination, sessionId, userId, payload.toString());
        messagingTemplate.convertAndSendToUser(userId.toString(), replacedDestination, payload);
    }

    public void sendMessageToUser(Long userId, String destination, Object payload) {
        log.debug("WS: [{}] sending message to user: id={}, payload={}", destination,  userId, payload.toString());
        messagingTemplate.convertAndSendToUser(userId.toString(), destination, payload);
    }

    public void sendMessageSessionBroadcast(Long sessionId, String destinationTemplate, Object payload) {
        String replacedDestination = destinationTemplate.replace(SESSION_ID, sessionId.toString());
        log.debug("WS: [{}] sending message broadcast to session: session={} payload={}", replacedDestination, sessionId,  payload.toString());
        messagingTemplate.convertAndSend(replacedDestination, payload);
    }

    public void sendMessageBroadcast(String destination, Object payload) {
        log.debug("WS: [{}] sending message broadcast: payload={}", destination, payload.toString());
        messagingTemplate.convertAndSend(destination, payload);
    }
}
