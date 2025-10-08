package ru.ngtu.sabacc.system.exception;

import ru.ngtu.sabacc.system.exception.message.ApplicationErrorCode;

/**
 * @author Egor Bokov
 */
public class UserAlreadyExistsException extends AppException {
    private static final ApplicationErrorCode ERROR_CODE = ApplicationErrorCode.ALREADY_EXISTS;

    public UserAlreadyExistsException(String username) {
        super("User with username %s already exists".formatted(username), ERROR_CODE);
    }
}
