package ru.ngtu.sabacc.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsersCleanupService {

    private final UserService userService;

    @Scheduled(cron = "${cron.user-cleanup}")
    public void cleanUp() {
        log.info("User cleanup: started");
        List<Long> allExpiredUserIds = userService.getAllExpiredUsers();
        for (Long userId : allExpiredUserIds) {
            userService.deleteUserById(userId);
        }
        log.info("User cleanup: finished");
    }
}
