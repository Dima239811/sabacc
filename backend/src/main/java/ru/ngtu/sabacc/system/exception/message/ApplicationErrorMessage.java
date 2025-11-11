package ru.ngtu.sabacc.system.exception.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * @author Egor Bokov
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationErrorMessage {
    private String message;
    private String errorCode;
    private HttpStatus httpStatus;
}
