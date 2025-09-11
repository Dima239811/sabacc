package ru.ngtu.sabacc;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/test")
public class TestController {

    @GetMapping("/reload")
    public String reload() {
        return "Reload test new: " + System.currentTimeMillis();
    }
}

