package ru.ngtu.sabacc.system.exception.advice;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.web.bind.annotation.ControllerAdvice;
import ru.ngtu.sabacc.system.exception.AppException;
import ru.ngtu.sabacc.system.exception.message.ApplicationErrorMessage;

/**
 * @author Egor Bokov
 */
@ControllerAdvice
public class GlobalMessageExceptionHandler extends BaseExceptionHandler {

    @MessageExceptionHandler
    public ResponseEntity<ApplicationErrorMessage> handleException(Throwable ex) {
        return buildResponse(buildMessage(ex));
    }

    @MessageExceptionHandler
    public ResponseEntity<ApplicationErrorMessage> handleException(AppException ex) {
        return buildResponse(buildMessage(ex));
    }
}
