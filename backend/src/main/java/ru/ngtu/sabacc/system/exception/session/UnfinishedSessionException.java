package ru.ngtu.sabacc.system.exception.session;

import ru.ngtu.sabacc.system.exception.AppException;
import ru.ngtu.sabacc.system.exception.message.ApplicationErrorCode;

/**
 * @author Egor Bokov
 */
public class UnfinishedSessionException extends AppException {
    public UnfinishedSessionException(Long userId) {
        super("User [%s] has unfinished session".formatted(userId), ApplicationErrorCode.UNFINISHED_SESSION);
    }
}
