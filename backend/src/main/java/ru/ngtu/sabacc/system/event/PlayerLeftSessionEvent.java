package ru.ngtu.sabacc.system.event;

public record PlayerLeftSessionEvent(Long sessionId, Long playerId, Long winnerId) {}
