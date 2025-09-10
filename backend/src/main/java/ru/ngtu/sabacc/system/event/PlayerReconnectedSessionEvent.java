package ru.ngtu.sabacc.system.event;

import ru.ngtu.sabacc.room.SessionRoom;

/**
 * @author Egor Bokov
 */
public record PlayerReconnectedSessionEvent(Long sessionId, Long playerId, SessionRoom sessionRoom)
{}
