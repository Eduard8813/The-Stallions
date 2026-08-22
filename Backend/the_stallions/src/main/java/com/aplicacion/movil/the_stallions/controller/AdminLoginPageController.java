package com.aplicacion.movil.the_stallions.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdminLoginPageController {

    @GetMapping("/admin/login")
    public String login() {
        return "admin/login";
    }
}
