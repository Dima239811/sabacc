package ru.ngtu.sabacc.system.event;

/**
 * @author Egor Bokov
 */
public record PlayerLeftSessionEvent(Long sessionId, Long playerId, Long winnerId)
{}
