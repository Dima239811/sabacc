package ru.ngtu.sabacc.system.exception.notfound;

import ru.ngtu.sabacc.system.exception.AppException;
import ru.ngtu.sabacc.system.exception.message.ApplicationErrorCode;

/**
 * @author Egor Bokov
 */
public class EntityNotFoundException extends AppException {
    private static final ApplicationErrorCode ERROR_CODE = ApplicationErrorCode.NOT_FOUND;

    public EntityNotFoundException(Class<?> clazz, Long id) {
        super("%s not found by id: [%d]".formatted(clazz.getSimpleName(), id), ERROR_CODE);
    }

    public EntityNotFoundException(Class<?> clazz, String message) {
        super("%s not found %s".formatted(clazz.getSimpleName(), message), ERROR_CODE);
    }
}
