package ru.ngtu.sabacc.system.exception.session;

import ru.ngtu.sabacc.system.exception.AppException;
import ru.ngtu.sabacc.system.exception.message.ApplicationErrorCode;

/**
 * @author Egor Bokov
 */
public class GameSessionNotFoundException extends AppException {
    public GameSessionNotFoundException(Long sessionId) {
        super("Game session not found: " + sessionId, ApplicationErrorCode.NOT_FOUND);
    }
}
