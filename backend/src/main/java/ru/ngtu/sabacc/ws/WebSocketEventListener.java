package ru.ngtu.sabacc.ws;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import ru.ngtu.sabacc.room.SessionRoomService;

/**
 * @author Egor Bokov
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener implements ApplicationListener<SessionDisconnectEvent> {

    private final SessionRoomService sessionRoomService;

    @Override
    public void onApplicationEvent(SessionDisconnectEvent event) {
        log.debug("WS: handling session disconnect event: {}", event);
        try {
            StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
            Long sessionId = (Long) headerAccessor.getSessionAttributes().get("sessionId");
            Long playerId = (Long) headerAccessor.getSessionAttributes().get("playerId");

            if (sessionId != null && playerId != null) {
                log.info("WS: Player [{}] disconnected from session [{}]", playerId, sessionId);
                sessionRoomService.handlePlayerSocketDisconnect(sessionId, playerId);
                // Логика обработки дисконнекта, используя sessionId и playerId
            }
        } catch (Exception e) {
            log.error("WS: Exception occurred while disconnecting from session: {}", e.getMessage());
        }
    }
}
