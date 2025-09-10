package ru.ngtu.sabacc.user;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static ru.ngtu.sabacc.constants.RestApiEndpoint.API_USERS;

@RestController
@RequestMapping(API_USERS)
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/search/all")
    public List<User> getAll() {
        return userService.getAllUsers();
    }

    @GetMapping("/search/by-id/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @GetMapping("/search/by-username/{username}")
    public User getUserByUsername(@PathVariable String username) {
        return userService.getUserByUsername(username);
    }

    @PostMapping("/create/anonymous")
    public User createUser(@RequestBody CreateUserDto dto) {
        return userService.createUser(dto);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUserById(id);
    }
}

