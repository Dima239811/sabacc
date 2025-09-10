package ru.ngtu.sabacc.room;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.ngtu.sabacc.system.event.*;
import ru.ngtu.sabacc.system.exception.notfound.EntityNotFoundException;
import ru.ngtu.sabacc.system.exception.session.*;
import ru.ngtu.sabacc.user.User;
import ru.ngtu.sabacc.user.UserService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionRoomService {

    private final SessionRoomRepository sessionRoomRepository;
    private final UserService userService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public List<SessionRoom> getAllRooms() {
        return sessionRoomRepository.findAll();
    }

    @Transactional
    public List<User> getSessionMembers(Long sessionId) {
        SessionRoom sessionRoom = sessionRoomRepository
                .findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException(SessionRoom.class, sessionId));

        return new ArrayList<>(List.of(sessionRoom.getPlayerFirst(), sessionRoom.getPlayerSecond()));
    }

    public SessionRoom getRoomById(Long id) {
        return sessionRoomRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException(SessionRoom.class, id));
    }

    public List<SessionRoom> getAllUserSessionRooms(Long userId) {
        return sessionRoomRepository.findAllByPlayerFirstIdOrPlayerSecondId(userId, userId);
    }

    public Optional<SessionRoom> getUserActiveSessions(Long userId) {
        return sessionRoomRepository.findByPlayerFirstIdOrPlayerSecondIdAndStatusNot(userId, userId, SessionRoomStatus.FINISHED);
    }

    public List<SessionRoom> getAvailableRoomsForJoin(Long userId) {
        if(userService.getUserById(userId) == null)
            throw new EntityNotFoundException(User.class, userId);
        throwIfUserHaveUnfinishedSessions(userId);
        return sessionRoomRepository.findAllAvailableForJoin(SessionRoomStatus.WAITING_SECOND_USER);
    }

    @Transactional
    public SessionRoom createSessionRoom(Long userId) {
        User user = userService.getUserById(userId);

        log.info("User [{}] creating session room", userId);
        sessionRoomRepository.findByPlayerFirstIdAndStatusNot(userId, SessionRoomStatus.FINISHED)
                .ifPresent(sessionRoom -> {throw new UnfinishedSessionException(userId);});

        SessionRoom newSessionRoom = SessionRoom.builder()
                .playerFirst(user)
                .status(SessionRoomStatus.WAITING_SECOND_USER)
                .build();

        SessionRoom createdSessionRoom = sessionRoomRepository.saveAndFlush(newSessionRoom);
        log.info("Session room: id={} was created", newSessionRoom.getId());

        eventPublisher.publishEvent(new SessionRoomCreatedEvent(createdSessionRoom));

        return createdSessionRoom;
    }

    @Transactional
    public void joinSession(Long sessionId, Long userId) {
        log.info("User [{}] joining session [{}]", userId, sessionId);

        SessionRoom sessionRoom = getRoomById(sessionId);
        User user = userService.getUserById(userId);

        throwIfUserHaveUnfinishedSessions(userId);

        if(sessionRoom.getStatus().equals(SessionRoomStatus.FINISHED))
            throw new JoinFinishedSessionException(userId, sessionId);

        if(sessionRoom.getPlayerSecond() != null) {
            if(sessionRoom.getPlayerSecond().equals(user))
                throw new UserAlreadyJoinedSessionException(sessionId, userId);
            throw new SessionIsFullException(sessionRoom.getId(), user.getId());
        }

        if(sessionRoom.getPlayerFirst().getId().equals(userId))
            throw new JoinSelfHostedSessionException(userId);

        sessionRoom.setPlayerSecond(user);
        sessionRoom.setStatus(SessionRoomStatus.ALL_USERS_JOINED);
        sessionRoomRepository.saveAndFlush(sessionRoom);
    }

    @Transactional
    public void leaveAllRooms(Long userId) {
        log.info("User [{}] leaving all sessions", userId);
        List<SessionRoom> userSessionRooms = getAllUserSessionRooms(userId);
        userSessionRooms.forEach(r -> leaveRoom(r.getId(), userId));
    }

    @Transactional
    public void leaveRoom(Long roomId, Long userId) {
        log.info("User [{}] leaving session [{}]", userId, roomId);

        SessionRoom sessionRoom = getRoomById(roomId);

        if(!roomContainsUser(sessionRoom, userId))
            throw new PlayerNotRelatedToSessionException(roomId, userId);

        //send finish dto to message exchanger
        long winnerId;
        if(sessionRoom.getPlayerFirst().getId().equals(userId))
            winnerId = sessionRoom.getPlayerSecond().getId();
        else
            winnerId = sessionRoom.getPlayerFirst().getId();

        eventPublisher.publishEvent(new PlayerLeftSessionEvent(roomId, userId, winnerId));

        SessionRoomStatus status = sessionRoom.getStatus();

        if(status.equals(SessionRoomStatus.FINISHED))
            return;

        if(status.equals(SessionRoomStatus.ALL_USERS_JOINED)
            && !sessionRoom.getPlayerFirst().getId().equals(userId)) {
            sessionRoom.setPlayerSecond(null);
            sessionRoom.setStatus(SessionRoomStatus.WAITING_SECOND_USER);
            sessionRoomRepository.saveAndFlush(sessionRoom);
            return;
        }

        deleteSessionRoom(sessionRoom);
    }

    @Transactional
    public void deleteSessionRoomById(Long roomId) {
        SessionRoom sessionRoom = sessionRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException(SessionRoom.class, roomId));
        deleteSessionRoom(sessionRoom);
    }

    @Transactional
    public void deleteSessionRoom(SessionRoom sessionRoom) {
        log.info("Deleting session room: id={}", sessionRoom.getId());

        eventPublisher.publishEvent(new SessionRoomDeletedEvent(sessionRoom));
        sessionRoomRepository.delete(sessionRoom);
    }

    @EventListener(UserDeletedEvent.class)
    @Transactional
    void onUserDeleted(UserDeletedEvent event) {
        List<SessionRoom> allUserSessionRooms = getAllUserSessionRooms(event.user().getId());
        for (SessionRoom sessionRoom : allUserSessionRooms) {
            deleteSessionRoom(sessionRoom);
        }
        sessionRoomRepository.deleteAll(allUserSessionRooms);
    }

    @Transactional
    public void handlePlayerSocketConnection(Long sessionId, Long playerId) {
        SessionRoom sessionRoom = switchPlayerSocketConnected(sessionId, playerId, true);

        if(sessionRoom.getStatus().equals(SessionRoomStatus.FINISHED))
            throw new JoinFinishedSessionException(playerId, sessionId);

        if(sessionRoom.isPlayerFirstConnected() && sessionRoom.isPlayerSecondConnected()) {
            if (sessionRoom.getStatus().equals(SessionRoomStatus.ALL_USERS_JOINED)) {
                updateSessionStatus(sessionRoom, SessionRoomStatus.ALL_USERS_CONNECTED);
                sessionRoomRepository.saveAndFlush(sessionRoom);
                eventPublisher.publishEvent(new SessionReadyEvent(sessionId, sessionRoom));
            }
            else {
                updateSessionStatus(sessionRoom, SessionRoomStatus.IN_PROGRESS);
                sessionRoomRepository.saveAndFlush(sessionRoom);
                eventPublisher.publishEvent(new PlayerReconnectedSessionEvent(sessionId, playerId, sessionRoom));
            }
        }
    }

    @Transactional
    public void handlePlayerSocketDisconnect(Long sessionId, Long playerId) {
        SessionRoom sessionRoom = switchPlayerSocketConnected(sessionId, playerId, false);

        if(!sessionRoom.isPlayerFirstConnected() && !sessionRoom.isPlayerSecondConnected()) {
            updateSessionStatus(sessionRoom, SessionRoomStatus.FINISHED);
            sessionRoomRepository.saveAndFlush(sessionRoom);
            eventPublisher.publishEvent(new SessionFinishedEvent(sessionId));
            return;
        }

        updateSessionStatus(sessionRoom, SessionRoomStatus.PLAYER_DISCONNECTED);
        sessionRoomRepository.saveAndFlush(sessionRoom);
        eventPublisher.publishEvent(new PlayerDisconnectedSessionEvent(sessionId, playerId, sessionRoom));
    }

    @EventListener(SessionStartedEvent.class)
    void onSessionStarted(SessionStartedEvent event) {
        SessionRoom sessionRoom = getRoomById(event.sessionId());
        updateSessionStatus(sessionRoom, SessionRoomStatus.IN_PROGRESS);
        sessionRoomRepository.saveAndFlush(sessionRoom);
    }

    @EventListener(SessionFinishedEvent.class)
    void onSessionFinished(SessionFinishedEvent event) {
        try {
            SessionRoom sessionRoom = getRoomById(event.sessionId());
            updateSessionStatus(sessionRoom, SessionRoomStatus.FINISHED);
            sessionRoomRepository.saveAndFlush(sessionRoom);
        } catch (Exception e) {
            log.error("[SessionRoomService] : Exception raised when handling session finished event: {}", e.getMessage());
        }
    }

    private SessionRoom switchPlayerSocketConnected(Long sessionId, Long playerId, boolean value) {
        SessionRoom sessionRoom = sessionRoomRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException(SessionRoom.class, sessionId));

        User playerFirst = sessionRoom.getPlayerFirst();
        if(playerFirst.getId().equals(playerId)) {
            sessionRoom.setPlayerFirstConnected(value);
            sessionRoomRepository.saveAndFlush(sessionRoom);
            return sessionRoom;
        }

        User playerSecond = sessionRoom.getPlayerSecond();
        if(playerSecond == null) {
            throw new SecondPlayerIsNotJoinedException(sessionId);
        }

        if(playerSecond.getId().equals(playerId)) {
            sessionRoom.setPlayerSecondConnected(value);
            sessionRoomRepository.saveAndFlush(sessionRoom);
            return sessionRoom;
        }

        throw new PlayerNotRelatedToSessionException(sessionId, playerId);
    }

    private void throwIfUserHaveUnfinishedSessions(Long userId) {
        getUserActiveSessions(userId)
                .ifPresent(s -> {
                    throw new UserHaveUnfinishedSessionException(userId);
                });
    }

    private boolean roomContainsUser(SessionRoom sessionRoom, Long userId) {
        if(sessionRoom.getPlayerFirst().getId().equals(userId))
            return true;
        User secondPlayer = sessionRoom.getPlayerSecond();
        if(secondPlayer == null)
            return false;

        return secondPlayer.getId().equals(userId);
    }

    private void updateSessionStatus(SessionRoom sessionRoom, SessionRoomStatus status) {
        sessionRoom.setStatus(status);
        log.debug("Session [{}]: updated status to {}", sessionRoom.getId(), sessionRoom.getStatus());
    }
}
