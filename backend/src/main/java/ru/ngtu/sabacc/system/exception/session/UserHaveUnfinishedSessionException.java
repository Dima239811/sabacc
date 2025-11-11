package ru.ngtu.sabacc.system.exception.session;

import ru.ngtu.sabacc.system.exception.AppException;
import ru.ngtu.sabacc.system.exception.message.ApplicationErrorCode;

/**
 * @author Egor Bokov
 */
public class UserHaveUnfinishedSessionException extends AppException {
    private static final String MESSAGE_TEMPLATE = "User [%s] is already have unfinished session.";
    private static final ApplicationErrorCode ERROR_CODE = ApplicationErrorCode.HAVE_UNFINISHED_SESSION;

    public UserHaveUnfinishedSessionException(Long userId) {
        super(MESSAGE_TEMPLATE.formatted(userId), ERROR_CODE);
    }
}
