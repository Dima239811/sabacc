package ru.ngtu.sabacc.constants;

/**
 * @author Egor Bokov
 */
public interface WebSocketApiEndpoint {
    // Prefix to all endpoints: /app

    String TOPIC = "/topic";
    String QUEUE = "/queue";
    String INPUT = "/input";

    String SESSION_ID = "{sessionId}";

    String WS_ACCEPTED_TURNS_QUEUE = QUEUE + "/session/" + SESSION_ID + "/accepted-turns";
    // Prefix for this endpoint is: /user/{userId}
    String WS_USER_SESSION_ERRORS_QUEUE = QUEUE + "/session/" + SESSION_ID + "/errors";
    String WS_SESSION_CHAT_QUEUE = QUEUE + "/session/" + SESSION_ID + "/chat";
    String WS_GAME_PROGRESS_QUEUE = QUEUE + "/session/" + SESSION_ID + "/game-progress";
    String WS_GAME_RESULTS_QUEUE = QUEUE + "/session/" + SESSION_ID + "/game-results";
    String WS_ROUND_RESULTS_QUEUE = QUEUE + "/session/" + SESSION_ID + "/round-results";

    String WS_SESSION_CHAT_TOPIC = TOPIC + "/session/" + SESSION_ID + "/chat";

    String WS_SESSION_CHAT_INPUT = INPUT + "/session/" + SESSION_ID + "/chat";
    String WS_SESSION_TURN_INPUT = INPUT + "/session/" + SESSION_ID + "/turn";
}
