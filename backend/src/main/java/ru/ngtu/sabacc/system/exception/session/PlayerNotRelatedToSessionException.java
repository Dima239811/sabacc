package ru.ngtu.sabacc.system.exception.session;

import ru.ngtu.sabacc.system.exception.AppException;
import ru.ngtu.sabacc.system.exception.message.ApplicationErrorCode;

/**
 * @author Egor Bokov
 */
public class PlayerNotRelatedToSessionException extends AppException {
    public PlayerNotRelatedToSessionException(Long sessionId, Long playerId) {
        super("Player [%s] not related to session [%s]".formatted(playerId, sessionId), ApplicationErrorCode.NOT_RELATED_TO_SESSION);
    }
}
