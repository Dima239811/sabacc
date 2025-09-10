package ru.ngtu.sabacc.system.exception.advice;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import ru.ngtu.sabacc.system.exception.AppException;
import ru.ngtu.sabacc.system.exception.message.ApplicationErrorCode;
import ru.ngtu.sabacc.system.exception.message.ApplicationErrorMessage;

/**
 * @author Egor Bokov
 */
@Slf4j
public class BaseExceptionHandler {
    private static final ApplicationErrorCode DEFAULT_ERROR_CODE = ApplicationErrorCode.INTERNAL_ERROR;

    public void logError(ApplicationErrorMessage errorMessage) {
        log.error("[{}] : {}", errorMessage.getErrorCode(), errorMessage.getMessage());
    }

    public ApplicationErrorMessage buildMessage(Throwable exception) {
        return ApplicationErrorMessage
                .builder()
                .message(exception.getMessage())
                .errorCode(DEFAULT_ERROR_CODE.getCode())
                .httpStatus(DEFAULT_ERROR_CODE.getHttpStatus())
                .build();
    }

    public ApplicationErrorMessage buildMessage(Throwable exception, ApplicationErrorCode errorCode) {
        return ApplicationErrorMessage
                .builder()
                .message(exception.getMessage())
                .errorCode(errorCode.getCode())
                .httpStatus(errorCode.getHttpStatus())
                .build();
    }

    public ApplicationErrorMessage buildMessage(AppException exception) {
        return ApplicationErrorMessage
                .builder()
                .message(exception.getMessage())
                .errorCode(exception.getErrorCode().getCode())
                .httpStatus(exception.getErrorCode().getHttpStatus())
                .build();
    }

    public ResponseEntity<ApplicationErrorMessage> buildResponse(ApplicationErrorMessage errorMessage) {
        logError(errorMessage);
        return ResponseEntity
                .status(errorMessage.getHttpStatus())
                .contentType(MediaType.APPLICATION_JSON)
                .body(errorMessage);
    }

}
