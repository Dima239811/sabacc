package ru.ngtu.sabacc.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;
import java.util.Optional;

@RepositoryRestResource(exported = false)
public interface SessionRoomRepository extends JpaRepository<SessionRoom, Long> {
    List<SessionRoom> findAllByPlayerFirstIdOrPlayerSecondId(Long playerFirst_id, Long playerSecond_id);
    Optional<SessionRoom> findByPlayerFirstIdAndStatusNot(Long playerId, SessionRoomStatus status);
    Optional<SessionRoom> findByPlayerFirstIdOrPlayerSecondIdAndStatusNot(Long playerFirstId,Long playerSecondId, SessionRoomStatus status);

    @Query("""
        select r
        from SessionRoom r
        where
            r.status=:availableStatus
        and
            r.playerSecond is null
    """)
    List<SessionRoom> findAllAvailableForJoin(SessionRoomStatus availableStatus);
}