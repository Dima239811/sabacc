package ru.ngtu.sabacc.room;

/**
 * @author Egor Bokov
 */
public enum SessionRoomStatus {
    WAITING_SECOND_USER,
    ALL_USERS_JOINED,
    ALL_USERS_CONNECTED,
    IN_PROGRESS,
    PLAYER_DISCONNECTED,
    FINISHED
}
