package ru.ngtu.sabacc.system.exception.notfound;

import ru.ngtu.sabacc.user.User;

/**
 * @author Egor Bokov
 */
public class UserNotFoundException extends EntityNotFoundException {
    public UserNotFoundException(Long id) {
        super(User.class, id);
    }
    public UserNotFoundException(String username) {
        super(User.class, "by username: %s".formatted(username));
    }
}
