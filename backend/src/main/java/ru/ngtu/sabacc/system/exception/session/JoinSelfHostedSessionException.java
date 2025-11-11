package ru.ngtu.sabacc.system.exception.session;

import ru.ngtu.sabacc.system.exception.AppException;
import ru.ngtu.sabacc.system.exception.message.ApplicationErrorCode;

/**
 * @author Egor Bokov
 */
public class JoinSelfHostedSessionException extends AppException {
    public JoinSelfHostedSessionException(Long userId) {
        super("User [%s] unable to join its hosted session".formatted(userId), ApplicationErrorCode.SELF_JOIN);
    }
}
