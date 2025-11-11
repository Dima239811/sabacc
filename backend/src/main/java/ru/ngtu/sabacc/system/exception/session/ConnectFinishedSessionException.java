package ru.ngtu.sabacc.system.exception.session;

import ru.ngtu.sabacc.system.exception.AppException;
import ru.ngtu.sabacc.system.exception.message.ApplicationErrorCode;

/**
 * @author Egor Bokov
 */
public class ConnectFinishedSessionException extends AppException {
    public ConnectFinishedSessionException(Long userId, Long sessionId) {
        super("User [%s] unable to connect finished session [%s]".formatted(userId, sessionId), ApplicationErrorCode.CONNECT_FINISHED);
    }
}
