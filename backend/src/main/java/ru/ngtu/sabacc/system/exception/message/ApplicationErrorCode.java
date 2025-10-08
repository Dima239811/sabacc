package ru.ngtu.sabacc.system.exception.message;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * @author Egor Bokov
 */
@Getter
@RequiredArgsConstructor
public enum ApplicationErrorCode {
    INTERNAL_ERROR("internal_error", HttpStatus.INTERNAL_SERVER_ERROR),
    NOT_FOUND("not_found", HttpStatus.NOT_FOUND),
    ALREADY_EXISTS("already_exists", HttpStatus.BAD_REQUEST),
    ALREADY_JOINED("already_joined", HttpStatus.BAD_REQUEST),
    UNFINISHED_SESSION("unfinished_session", HttpStatus.BAD_REQUEST),
    SESSION_IS_FULL("session_is_full", HttpStatus.BAD_REQUEST),
    VALIDATION_ERROR("validation_error", HttpStatus.BAD_REQUEST),
    NOT_JOINED("not_joined", HttpStatus.BAD_REQUEST),
    NOT_RELATED_TO_SESSION("not_related_to_session", HttpStatus.BAD_REQUEST),
    SELF_JOIN("self_join", HttpStatus.BAD_REQUEST),
    HAVE_UNFINISHED_SESSION("have_unfinished_session", HttpStatus.BAD_REQUEST),
    JOIN_FINISHED("join_finished", HttpStatus.BAD_REQUEST),
    CONNECT_FINISHED("connect_finished", HttpStatus.BAD_REQUEST);

    private final String code;
    private final HttpStatus httpStatus;
}
