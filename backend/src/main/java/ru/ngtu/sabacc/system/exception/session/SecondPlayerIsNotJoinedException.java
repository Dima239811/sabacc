package ru.ngtu.sabacc.system.exception.session;

import ru.ngtu.sabacc.system.exception.AppException;
import ru.ngtu.sabacc.system.exception.message.ApplicationErrorCode;

/**
 * @author Egor Bokov
 */
public class SecondPlayerIsNotJoinedException extends AppException {
    public SecondPlayerIsNotJoinedException(Long sessionId) {
        super("Second player is not joined to session %s".formatted(sessionId), ApplicationErrorCode.NOT_JOINED);
    }
}
