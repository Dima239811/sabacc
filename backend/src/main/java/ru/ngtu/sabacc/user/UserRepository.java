package ru.ngtu.sabacc.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;
import java.util.Optional;

@RepositoryRestResource(exported = false)
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    @Query(value = """
        SELECT users.id
        FROM users
                 JOIN session_rooms
                      ON users.id = session_rooms.player_first_id
                          OR users.id = session_rooms.player_second_id
        WHERE users.expire_at < CURRENT_TIMESTAMP
        GROUP BY users.id
        HAVING COUNT(CASE WHEN session_rooms.status != 'FINISHED' THEN 1 END) = 0;
   """, nativeQuery = true)
    List<Long> findAllExpiredUsers();
}