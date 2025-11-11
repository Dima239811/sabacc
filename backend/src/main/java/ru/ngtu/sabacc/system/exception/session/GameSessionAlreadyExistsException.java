package ru.ngtu.sabacc.system.exception.session;

import ru.ngtu.sabacc.system.exception.AppException;
import ru.ngtu.sabacc.system.exception.message.ApplicationErrorCode;

/**
 * @author Egor Bokov
 */
public class GameSessionAlreadyExistsException extends AppException {

    public GameSessionAlreadyExistsException(Long sessionId) {
        super("Game session already exists: " + sessionId, ApplicationErrorCode.ALREADY_EXISTS);
    }
}
