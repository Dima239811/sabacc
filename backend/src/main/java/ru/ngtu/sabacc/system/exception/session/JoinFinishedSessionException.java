package ru.ngtu.sabacc.system.exception.session;

import ru.ngtu.sabacc.system.exception.AppException;
import ru.ngtu.sabacc.system.exception.message.ApplicationErrorCode;

/**
 * @author Egor Bokov
 */
public class JoinFinishedSessionException extends AppException {
    public JoinFinishedSessionException(Long userId, Long sessionId) {
        super("User [%s] unable to join finished session [%s]".formatted(userId, sessionId), ApplicationErrorCode.JOIN_FINISHED);
    }
}
