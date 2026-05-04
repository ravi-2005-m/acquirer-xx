package com.acquirerx.backend.common.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "13. Health")
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "AcquirerX Running!";
    }
}
