package com.acquirerx.backend.iam.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponseDTO {

    private String token;       // JWT token — copy this and use in Authorize
    private String username;
    private String role;
    private String message;
}
