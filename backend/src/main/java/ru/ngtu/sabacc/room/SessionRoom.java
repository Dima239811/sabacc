package ru.ngtu.sabacc.room;

import jakarta.persistence.*;
import lombok.*;
import ru.ngtu.sabacc.system.model.BaseEntity;
import ru.ngtu.sabacc.user.User;

@Entity
@Table(name = "session_rooms")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionRoom extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionRoomStatus status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "player_first_id", nullable = false)
    private User playerFirst;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "player_second_id")
    private User playerSecond;

    @Column(name = "is_player_first_connected", nullable = false)
    @Builder.Default
    private boolean isPlayerFirstConnected = false;

    @Column(name = "is_player_second_connected", nullable = false)
    @Builder.Default
    private boolean isPlayerSecondConnected = false;
}