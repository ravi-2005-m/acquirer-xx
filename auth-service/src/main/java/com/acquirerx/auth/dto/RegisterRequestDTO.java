package com.acquirerx.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequestDTO {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 30, message = "Username must be 3-30 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$",
        message = "Username can only contain letters, numbers, and underscores")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "^(ADMIN|RISK|DISPUTES|RECON|MERCHANT_OPS|POS_OPS)$",
        message = "Role must be ADMIN, RISK, DISPUTES, RECON, MERCHANT_OPS, or POS_OPS")
    private String role;

    @Email(message = "Email should be valid")
    private String email;

    @Size(max = 100, message = "Name must be at most 100 characters")
    private String name;

    @Pattern(regexp = "^$|^[+0-9 ()\\-]{6,20}$",
        message = "Phone must be 6-20 digits and may include +, spaces, parentheses, or dashes")
    private String phone;
}
