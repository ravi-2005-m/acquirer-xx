package com.acquirerx.auth.dto;

import lombok.Data;

@Data
public class UserFilterDTO {

    private String username;
    private String role;
    private String status;
    private String email;
}
