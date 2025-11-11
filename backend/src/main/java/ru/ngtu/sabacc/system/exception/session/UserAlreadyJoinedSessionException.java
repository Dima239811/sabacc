package ru.ngtu.sabacc.system.exception.session;

import ru.ngtu.sabacc.system.exception.AppException;
import ru.ngtu.sabacc.system.exception.message.ApplicationErrorCode;

/**
 * @author Egor Bokov
 */
public class UserAlreadyJoinedSessionException extends AppException {
    private static final String MESSAGE_TEMPLATE = "User [%s] already joined to session room [%s]";
    private static final ApplicationErrorCode ERROR_CODE = ApplicationErrorCode.ALREADY_JOINED;

    public UserAlreadyJoinedSessionException(Long roomId, Long userId) {
        super(MESSAGE_TEMPLATE.formatted(userId, roomId), ERROR_CODE);
    }
}
