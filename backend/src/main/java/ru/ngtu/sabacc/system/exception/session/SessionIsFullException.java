package ru.ngtu.sabacc.system.exception.session;

import ru.ngtu.sabacc.system.exception.AppException;
import ru.ngtu.sabacc.system.exception.message.ApplicationErrorCode;

/**
 * @author Egor Bokov
 */
public class SessionIsFullException extends AppException {
    private static final String MESSAGE_TEMPLATE = "User [%s] trying to join session room [%s], but it's full";
    private static final ApplicationErrorCode ERROR_CODE = ApplicationErrorCode.SESSION_IS_FULL;

    public SessionIsFullException(Long roomId, Long userId) {
        super(MESSAGE_TEMPLATE.formatted(userId, roomId), ERROR_CODE);
    }
}
