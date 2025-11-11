package ru.ngtu.sabacc.system.event;

import ru.ngtu.sabacc.room.SessionRoom;

/**
 * @author Egor Bokov
 */
public record SessionRoomCreatedEvent(SessionRoom sessionRoom) {
}
