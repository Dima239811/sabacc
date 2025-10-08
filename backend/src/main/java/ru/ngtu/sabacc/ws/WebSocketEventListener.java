package ru.ngtu.sabacc.ws;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import ru.ngtu.sabacc.room.SessionRoomService;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener implements ApplicationListener<SessionDisconnectEvent> {

    private final SessionRoomService sessionRoomService;


    @Override
    public void onApplicationEvent(SessionDisconnectEvent event) {
        try {
            StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
            if (headerAccessor.getSessionAttributes() == null) {
                log.warn("WS: sessionAttributes is null on disconnect event");
                return;
            }
            Object sessionIdObj = headerAccessor.getSessionAttributes().get("sessionId");
            Object playerIdObj = headerAccessor.getSessionAttributes().get("playerId");
            log.debug("WS: sessionAttributes on disconnect: sessionId={}, playerId={}", sessionIdObj, playerIdObj);
            Long sessionId = null;
            Long playerId = null;
            try {
                if (sessionIdObj instanceof Long) {
                    sessionId = (Long) sessionIdObj;
                } else if (sessionIdObj instanceof String) {
                    sessionId = Long.valueOf((String) sessionIdObj);
                }
                if (playerIdObj instanceof Long) {
                    playerId = (Long) playerIdObj;
                } else if (playerIdObj instanceof String) {
                    playerId = Long.valueOf((String) playerIdObj);
                }
            } catch (NumberFormatException nfe) {
                log.error("WS: Failed to parse sessionId or playerId from sessionAttributes", nfe);
            }
            if (sessionId != null && playerId != null) {
                log.info("WS: Player [{}] disconnected from session [{}]", playerId, sessionId);
                sessionRoomService.handlePlayerSocketDisconnect(sessionId, playerId);
            } else {
                log.warn("WS: Missing or invalid sessionId/playerId in sessionAttributes on disconnect: sessionId={}, playerId={}", sessionIdObj, playerIdObj);
            }
        } catch (Exception e) {
            log.error("WS: Exception occurred while disconnecting from session: {}", e.getMessage(), e);
        }
    }
}
