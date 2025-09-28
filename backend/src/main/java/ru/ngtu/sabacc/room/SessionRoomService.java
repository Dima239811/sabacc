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



    public List<SessionRoom> getUserActiveSessions(Long userId) {
        List<SessionRoom> sessions = sessionRoomRepository.findByPlayerFirstIdOrPlayerSecondIdAndStatusNot(
                userId, userId, SessionRoomStatus.FINISHED
        );
        // Убираем сессии, где игрок первый, а второго нет
        return sessions.stream()
                .filter(s -> s.getPlayerFirst() != null && s.getPlayerSecond() != null)
                .toList();
    }


//    public Optional<SessionRoom> getUserActiveSessions(Long userId) {
//        return sessionRoomRepository.findByPlayerFirstIdOrPlayerSecondIdAndStatusNot(userId, userId, SessionRoomStatus.FINISHED);
//    }

    public List<SessionRoom> getAvailableRoomsForJoin(Long userId) {
        log.warn("WARN ВЫЗВАН МЕТОД В SessionRoomService");
        System.out.println("CALL getAvailableRoomsForJoin");

        if (userService.getUserById(userId) == null) {
            throw new EntityNotFoundException(User.class, userId);
        }

        // Проверка активных сессий
        List<SessionRoom> activeSessions = getUserActiveSessions(userId);
        if (!activeSessions.isEmpty()) {
            System.out.println("есть незавершенные сессии");
            throw new UserHaveUnfinishedSessionException(userId);
        }

        // Получаем все доступные комнаты
        List<SessionRoom> availableRooms = sessionRoomRepository.findAllAvailableForJoin(SessionRoomStatus.WAITING_SECOND_USER);
        log.info("Available rooms for user {}: {}", userId, availableRooms);

        return availableRooms;
    }

    @Transactional
    public SessionRoom createSessionRoom(Long userId) {
        User user = userService.getUserById(userId);

        log.info("User [{}] creating session room", userId);

        List<SessionRoom> unfinished = sessionRoomRepository.findAllByPlayerFirstIdAndStatusNot(userId, SessionRoomStatus.FINISHED);
        if (!unfinished.isEmpty()) {
            throw new UnfinishedSessionException(userId);
        }

        SessionRoom newSessionRoom = SessionRoom.builder()
                .playerFirst(user)
                .status(SessionRoomStatus.WAITING_SECOND_USER)
                .build();

        SessionRoom createdSessionRoom = sessionRoomRepository.saveAndFlush(newSessionRoom);
        log.info("Session room: id={} was created", createdSessionRoom.getId());

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
        log.info("User leave");

        SessionRoom sessionRoom = getRoomById(roomId);

        if (!roomContainsUser(sessionRoom, userId)) {
            throw new PlayerNotRelatedToSessionException(roomId, userId);
        }

        // Если выходит первый игрок
        if (sessionRoom.getPlayerFirst().getId().equals(userId)) {
            if (sessionRoom.getPlayerSecond() != null) {
                // переносим второго в "первого"
                User newFirst = sessionRoom.getPlayerSecond();
                sessionRoom.setPlayerFirst(newFirst);
                sessionRoom.setPlayerSecond(null);
                sessionRoom.setStatus(SessionRoomStatus.WAITING_SECOND_USER);
                sessionRoomRepository.saveAndFlush(sessionRoom);

                Long winnerId = newFirst.getId(); // считаем вторым победителем
                eventPublisher.publishEvent(new PlayerLeftSessionEvent(roomId, userId, winnerId));
            } else {
                // если никого не осталось → удаляем комнату
                sessionRoom.setStatus(SessionRoomStatus.FINISHED);
                deleteSessionRoom(sessionRoom);
                log.info("Никого не осталось в комнате [{}], событие PlayerLeftSessionEvent не публикуется", roomId);
            }
            return;
        }

        // Если выходит второй игрок
        if (sessionRoom.getPlayerSecond() != null && sessionRoom.getPlayerSecond().getId().equals(userId)) {
            Long winnerId = sessionRoom.getPlayerFirst() != null ? sessionRoom.getPlayerFirst().getId() : null;

            sessionRoom.setPlayerSecond(null);
            sessionRoom.setStatus(SessionRoomStatus.WAITING_SECOND_USER);
            sessionRoomRepository.saveAndFlush(sessionRoom);

            if (winnerId != null) {
                eventPublisher.publishEvent(new PlayerLeftSessionEvent(roomId, userId, winnerId));
            } else {
                log.info("Победителя нет для комнаты [{}], событие PlayerLeftSessionEvent не публикуется", roomId);
            }
            return;
        }

        // На всякий случай — если пользователь не первый и не второй
        log.warn("User [{}] не найден в комнате [{}] при выходе", userId, roomId);
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
        SessionRoom sessionRoom = getRoomById(event.sessionId());
        if (sessionRoom.getStatus() != SessionRoomStatus.FINISHED) {
            updateSessionStatus(sessionRoom, SessionRoomStatus.FINISHED);
            sessionRoomRepository.saveAndFlush(sessionRoom);
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
        List<SessionRoom> activeSessions = sessionRoomRepository.findByPlayerFirstIdOrPlayerSecondIdAndStatusNot(
                userId, userId, SessionRoomStatus.FINISHED
        );
        if (!activeSessions.isEmpty()) {
            throw new UserHaveUnfinishedSessionException(userId);
        }
    }


    private boolean roomContainsUser(SessionRoom sessionRoom, Long userId) {
        if (sessionRoom.getPlayerFirst().getId().equals(userId))
            return true;
        User secondPlayer = sessionRoom.getPlayerSecond();
        if (secondPlayer == null)
            return false;

        return secondPlayer.getId().equals(userId);
    }

    private void updateSessionStatus(SessionRoom sessionRoom, SessionRoomStatus status) {
        sessionRoom.setStatus(status);
        log.debug("Session [{}]: updated status to {}", sessionRoom.getId(), sessionRoom.getStatus());
    }
}
