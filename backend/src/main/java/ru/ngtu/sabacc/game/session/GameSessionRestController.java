package ru.ngtu.sabacc.game.session;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.ngtu.sabacc.gamecore.game.GameStateDto;
import ru.ngtu.sabacc.gamecore.turn.TurnDto;

import static ru.ngtu.sabacc.constants.RestApiEndpoint.API_SESSION_ROOM;

/**
 * @author Egor Bokov
 */
@RestController
@RequestMapping(API_SESSION_ROOM)
@RequiredArgsConstructor
public class GameSessionRestController {

    private final GameSessionService gameSessionService;

    @GetMapping("/game/current-state")
    public GameStateDto getCurrentState(@RequestParam Long sessionId) {
        return gameSessionService.getCurrentGameState(sessionId);
    }
}
