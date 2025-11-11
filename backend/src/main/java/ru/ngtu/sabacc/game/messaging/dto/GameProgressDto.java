package ru.ngtu.sabacc.game.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * @author Egor Bokov
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameProgressDto {
    private GameProgressStatus status;
    private Map<String, Object> details;
}
