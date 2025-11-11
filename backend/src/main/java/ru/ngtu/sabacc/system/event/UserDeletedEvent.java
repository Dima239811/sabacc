package ru.ngtu.sabacc.system.event;

import ru.ngtu.sabacc.user.User;

/**
 * @author Egor Bokov
 */
public record UserDeletedEvent(User user) {
}
